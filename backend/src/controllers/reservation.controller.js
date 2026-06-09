import prisma from "../config/prisma.js";
import { getFeeForVehicleType } from "../services/pricing.service.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ACTIVE_RESERVATION_STATUSES = ["CONFIRMED", "CHECKED_IN"];

const FINAL_RESERVATION_STATUSES = ["CANCELLED", "COMPLETED"];

const VALID_RESERVATION_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "CANCELLED",
  "COMPLETED",
];

const BLOCKED_SLOT_STATUSES = ["OCCUPIED", "MAINTENANCE"];

const STAFF_ALLOWED_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "CANCELLED",
  "COMPLETED",
];

const USER_CANCELLABLE_STATUSES = ["CONFIRMED"];

const ACTIVE_PARKING_SESSION_STATUSES = ["ACTIVE"];

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
};

const isAdminOrManager = (role) => {
  return role === "ADMIN" || role === "MANAGER";
};

const isStaffLevel = (role) => {
  return role === "ADMIN" || role === "MANAGER" || role === "STAFF";
};

const isValidDate = (date) => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};

const mapReservationResponse = (reservation) => {
  const latestPayment = Array.isArray(reservation.payments)
    ? reservation.payments[0]
    : null;

  return {
    id: reservation.id,
    userId: reservation.user_id,
    user: reservation.users
      ? {
          id: reservation.users.id,
          fullName: reservation.users.full_name,
          email: reservation.users.email,
          phone: reservation.users.phone,
        }
      : null,

    vehicleTypeId: reservation.vehicle_type_id,
    vehicleType: reservation.vehicle_types
      ? {
          id: reservation.vehicle_types.id,
          typeName: reservation.vehicle_types.type_name,
          description: reservation.vehicle_types.description,
        }
      : null,

    parkingSlotId: reservation.parking_slot_id,
    parkingSlot: reservation.parking_slots
      ? {
          id: reservation.parking_slots.id,
          slotName: reservation.parking_slots.slot_name,
          status: reservation.parking_slots.status,
          zoneId: reservation.parking_slots.zone_id,
          zone: reservation.parking_slots.zones
            ? {
                id: reservation.parking_slots.zones.id,
                zoneName: reservation.parking_slots.zones.zone_name,
                totalCapacity: reservation.parking_slots.zones.total_capacity,
              }
            : null,
        }
      : null,

    startTime: reservation.expected_start_time,
    endTime: reservation.expected_end_time,
    status: reservation.status,
    createdAt: reservation.created_at,
    estimatedFee: reservation.estimatedFee ?? 0,
    parkingHours: reservation.parkingHours ?? 0,
    payment: latestPayment
      ? {
          id: latestPayment.id,
          amount: Number(latestPayment.amount),
          method: latestPayment.payment_method,
          status: latestPayment.status,
          paidAt: latestPayment.payment_time,
        }
      : null,
  };
};

const mapReservationResponseWithFee = async (reservation) => {
  const fee = await getFeeForVehicleType(
    reservation.vehicle_type_id,
    reservation.expected_start_time,
    reservation.expected_end_time,
  );

  return mapReservationResponse({
    ...reservation,
    estimatedFee: fee.totalAmount,
    parkingHours: fee.parkingHours,
  });
};

const reservationInclude = {
  users: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
    },
  },
  vehicle_types: {
    select: {
      id: true,
      type_name: true,
      description: true,
    },
  },
  parking_slots: {
    select: {
      id: true,
      slot_name: true,
      status: true,
      zone_id: true,
      zones: {
        select: {
          id: true,
          zone_name: true,
          total_capacity: true,
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      payment_method: true,
      payment_time: true,
      status: true,
    },
    orderBy: {
      payment_time: "desc",
    },
    take: 1,
  },
};

const checkReservationOverlap = async ({
  parkingSlotId,
  startTime,
  endTime,
  excludeReservationId,
}) => {
  return prisma.reservations.findFirst({
    where: {
      parking_slot_id: parkingSlotId,
      status: {
        in: ACTIVE_RESERVATION_STATUSES,
      },
      expected_start_time: {
        lt: endTime,
      },
      expected_end_time: {
        gt: startTime,
      },
      ...(excludeReservationId && {
        NOT: {
          id: excludeReservationId,
        },
      }),
    },
  });
};

export const getReservations = async (req, res) => {
  try {
    const where = req.user.role === "USER" ? { user_id: req.user.id } : {};

    const reservations = await prisma.reservations.findMany({
      where,
      include: reservationInclude,
      orderBy: {
        created_at: "desc",
      },
    });

    return res.json({
      success: true,
      message: "Get reservations successfully",
      data: await Promise.all(reservations.map(mapReservationResponseWithFee)),
    });
  } catch (error) {
    console.error("Get reservations error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation id",
      });
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id },
      include: reservationInclude,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (req.user.role === "USER" && reservation.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.json({
      success: true,
      message: "Get reservation detail successfully",
      data: await mapReservationResponseWithFee(reservation),
    });
  } catch (error) {
    console.error("Get reservation detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { parkingSlotId, vehicleTypeId, userId, startTime, endTime } =
      req.body;

    if (!parkingSlotId || !vehicleTypeId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!isValidUUID(parkingSlotId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parkingSlotId",
      });
    }

    if (!isValidUUID(vehicleTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicleTypeId",
      });
    }

    if (userId && !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (!isValidDate(parsedStartTime) || !isValidDate(parsedEndTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startTime or endTime",
      });
    }

    if (parsedStartTime >= parsedEndTime) {
      return res.status(400).json({
        success: false,
        message: "startTime must be before endTime",
      });
    }

    if (req.user.role === "STAFF") {
      return res.status(403).json({
        success: false,
        message: "Staff is not allowed to create reservations",
      });
    }

    const finalUserId =
      req.user.role === "USER" ? req.user.id : userId || req.user.id;

    const user = await prisma.users.findUnique({
      where: { id: finalUserId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const parkingSlot = await prisma.parking_slots.findUnique({
      where: { id: parkingSlotId },
      include: {
        zones: true,
      },
    });

    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found",
      });
    }

    if (BLOCKED_SLOT_STATUSES.includes(parkingSlot.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot reserve occupied or maintenance parking slot",
      });
    }

    const vehicleType = await prisma.vehicle_types.findUnique({
      where: { id: vehicleTypeId },
    });

    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    if (!parkingSlot.zones?.vehicle_type_id) {
      return res.status(400).json({
        success: false,
        message: "Parking slot zone does not support reservations by vehicle type",
      });
    }

    if (parkingSlot.zones.vehicle_type_id !== vehicleTypeId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type does not match parking slot zone",
      });
    }

    const overlappedReservation = await checkReservationOverlap({
      parkingSlotId,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
    });

    if (overlappedReservation) {
      return res.status(409).json({
        success: false,
        message:
          "Parking slot already has an active reservation in this time range",
      });
    }

    const reservation = await prisma.reservations.create({
      data: {
        user_id: finalUserId,
        vehicle_type_id: vehicleTypeId,
        parking_slot_id: parkingSlotId,
        expected_start_time: parsedStartTime,
        expected_end_time: parsedEndTime,
        status: "CONFIRMED",
      },
      include: reservationInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Create reservation successfully",
      data: await mapReservationResponseWithFee(reservation),
    });
  } catch (error) {
    console.error("Create reservation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { parkingSlotId, vehicleTypeId, startTime, endTime, status } =
      req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation id",
      });
    }

    if (parkingSlotId && !isValidUUID(parkingSlotId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parkingSlotId",
      });
    }

    if (vehicleTypeId && !isValidUUID(vehicleTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicleTypeId",
      });
    }

    if (status && !VALID_RESERVATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status",
      });
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (req.user.role === "USER" && reservation.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      req.user.role === "USER" &&
      FINAL_RESERVATION_STATUSES.includes(reservation.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot update completed or cancelled reservation",
      });
    }

    if (req.user.role === "STAFF") {
      if (
        !status ||
        Object.keys(req.body).some(
          (key) => key !== "status" && key !== "parkingSlotId",
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Staff can only update reservation status and assigned slot",
        });
      }

      if (!STAFF_ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Staff cannot update to this reservation status",
        });
      }
    }

    if (!isStaffLevel(req.user.role) && req.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const nextParkingSlotId = parkingSlotId || reservation.parking_slot_id;
    const nextVehicleTypeId = vehicleTypeId || reservation.vehicle_type_id;
    const nextStartTime = startTime
      ? new Date(startTime)
      : reservation.expected_start_time;
    const nextEndTime = endTime
      ? new Date(endTime)
      : reservation.expected_end_time;

    if (!isValidDate(nextStartTime) || !isValidDate(nextEndTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startTime or endTime",
      });
    }

    if (nextStartTime >= nextEndTime) {
      return res.status(400).json({
        success: false,
        message: "startTime must be before endTime",
      });
    }

    if (parkingSlotId) {
      const parkingSlot = await prisma.parking_slots.findUnique({
        where: { id: parkingSlotId },
        include: {
          zones: true,
        },
      });

      if (!parkingSlot) {
        return res.status(404).json({
          success: false,
          message: "Parking slot not found",
        });
      }

      if (BLOCKED_SLOT_STATUSES.includes(parkingSlot.status)) {
        return res.status(400).json({
          success: false,
          message: "Cannot reserve occupied or maintenance parking slot",
        });
      }

      if (!parkingSlot.zones?.vehicle_type_id) {
        return res.status(400).json({
          success: false,
          message:
            "Parking slot zone does not support reservations by vehicle type",
        });
      }

      if (parkingSlot.zones.vehicle_type_id !== nextVehicleTypeId) {
        return res.status(400).json({
          success: false,
          message: "Vehicle type does not match parking slot zone",
        });
      }
    }

    if (vehicleTypeId) {
      const vehicleType = await prisma.vehicle_types.findUnique({
        where: { id: vehicleTypeId },
      });

      if (!vehicleType) {
        return res.status(404).json({
          success: false,
          message: "Vehicle type not found",
        });
      }
    }

    if (
      nextParkingSlotId &&
      (!status || ACTIVE_RESERVATION_STATUSES.includes(status))
    ) {
      const overlappedReservation = await checkReservationOverlap({
        parkingSlotId: nextParkingSlotId,
        startTime: nextStartTime,
        endTime: nextEndTime,
        excludeReservationId: id,
      });

      if (overlappedReservation) {
        return res.status(409).json({
          success: false,
          message:
            "Parking slot already has an active reservation in this time range",
        });
      }
    }

    const updatedReservation = await prisma.reservations.update({
      where: { id },
      data: {
        ...(parkingSlotId && { parking_slot_id: parkingSlotId }),
        ...(vehicleTypeId && { vehicle_type_id: vehicleTypeId }),
        ...(startTime && { expected_start_time: nextStartTime }),
        ...(endTime && { expected_end_time: nextEndTime }),
        ...(status && { status }),
      },
      include: reservationInclude,
    });

    return res.json({
      success: true,
      message: "Update reservation successfully",
      data: await mapReservationResponseWithFee(updatedReservation),
    });
  } catch (error) {
    console.error("Update reservation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation id",
      });
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (req.user.role === "STAFF") {
      return res.status(403).json({
        success: false,
        message: "Staff is not allowed to delete reservations",
      });
    }

    if (!isAdminOrManager(req.user.role)) {
      if (req.user.role !== "USER" || reservation.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    if (["CHECKED_IN", "COMPLETED"].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete checked-in or completed reservation",
      });
    }

    const cancelledReservation = await prisma.reservations.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
      include: reservationInclude,
    });

    return res.json({
      success: true,
      message: "Cancel reservation successfully",
      data: await mapReservationResponseWithFee(cancelledReservation),
    });
  } catch (error) {
    console.error("Delete reservation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const cancelMyReservation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation id",
      });
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id },
      include: reservationInclude,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (reservation.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own reservation",
      });
    }

    if (!USER_CANCELLABLE_STATUSES.includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: "Only confirmed reservations can be cancelled",
      });
    }

    const updatedReservation = await prisma.$transaction(async (tx) => {
      const cancelledReservation = await tx.reservations.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
        include: reservationInclude,
      });

      if (reservation.parking_slot_id) {
        const activeReservationCount = await tx.reservations.count({
          where: {
            parking_slot_id: reservation.parking_slot_id,
            status: {
              in: ACTIVE_RESERVATION_STATUSES,
            },
            NOT: {
              id,
            },
          },
        });

        const activeSessionCount = await tx.parking_sessions.count({
          where: {
            status: {
              in: ACTIVE_PARKING_SESSION_STATUSES,
            },
            OR: [
              { parking_slot_id: reservation.parking_slot_id },
              { assigned_slot_id: reservation.parking_slot_id },
            ],
          },
        });

        if (activeReservationCount === 0 && activeSessionCount === 0) {
          await tx.parking_slots.update({
            where: {
              id: reservation.parking_slot_id,
            },
            data: {
              status: "AVAILABLE",
            },
          });
        }
      }

      return cancelledReservation;
    });

    return res.json({
      success: true,
      message: "Reservation cancelled successfully",
      data: {
        id: updatedReservation.id,
        status: updatedReservation.status,
        slotName: updatedReservation.parking_slots?.slot_name || null,
        reservation: await mapReservationResponseWithFee(updatedReservation),
      },
    });
  } catch (error) {
    console.error("Cancel my reservation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
