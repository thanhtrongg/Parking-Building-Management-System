import prisma from "../config/prisma.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_SLOT_STATUSES = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "MAINTENANCE",
];

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
};

export const getParkingSlots = async (req, res) => {
  try {
    const parkingSlots = await prisma.$queryRaw`
            SELECT
                ps.id,
                ps.slot_name AS "slotNumber",
                ps.slot_name AS "slotName",
                ps.status,
                ps.distance_to_gate AS "distanceToGate",

                z.id AS "zoneId",
                z.zone_name AS "zoneName",
                z.total_capacity AS "totalCapacity",

                vt.id AS "vehicleTypeId",
                vt.type_name AS "vehicleTypeName"
            FROM parking_slots ps
            LEFT JOIN zones z ON ps.zone_id = z.id
            LEFT JOIN vehicle_types vt ON z.vehicle_type_id = vt.id
            ORDER BY z.zone_name ASC, ps.slot_name ASC
        `;

    return res.json({
      success: true,
      message: "Get parking slots successfully",
      data: parkingSlots,
    });
  } catch (error) {
    console.error("Get parking slots error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createParkingSlot = async (req, res) => {
  try {
    const {
      slotNumber,
      slotName,
      zoneId,
      status = "AVAILABLE",
      distanceToGate = 0,
    } = req.body;

    const finalSlotName = slotNumber || slotName;

    if (!finalSlotName || !zoneId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!isValidUUID(zoneId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zoneId",
      });
    }

    if (status && !VALID_SLOT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot status",
      });
    }

    const zone = await prisma.zones.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found",
      });
    }

    const normalizedSlotName = finalSlotName.trim();

    const existingSlot = await prisma.parking_slots.findFirst({
      where: {
        zone_id: zoneId,
        slot_name: normalizedSlotName,
      },
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: "Parking slot already exists in this zone",
      });
    }

    const parkingSlot = await prisma.parking_slots.create({
      data: {
        slot_name: normalizedSlotName,
        zone_id: zoneId,
        status,
        distance_to_gate: Number(distanceToGate) || 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create parking slot successfully",
      data: parkingSlot,
    });
  } catch (error) {
    console.error("Create parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotNumber, slotName, zoneId, status, distanceToGate } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot id",
      });
    }

    if (zoneId && !isValidUUID(zoneId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zoneId",
      });
    }

    if (status && !VALID_SLOT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot status",
      });
    }

    const parkingSlot = await prisma.parking_slots.findUnique({
      where: { id },
    });

    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found",
      });
    }

    if (zoneId) {
      const zone = await prisma.zones.findUnique({
        where: { id: zoneId },
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: "Zone not found",
        });
      }
    }

    const finalSlotName = slotNumber || slotName;
    const nextZoneId = zoneId || parkingSlot.zone_id;
    const nextSlotName = finalSlotName
      ? finalSlotName.trim()
      : parkingSlot.slot_name;

    const duplicateSlot = await prisma.parking_slots.findFirst({
      where: {
        zone_id: nextZoneId,
        slot_name: nextSlotName,
        NOT: {
          id,
        },
      },
    });

    if (duplicateSlot) {
      return res.status(400).json({
        success: false,
        message: "Parking slot already exists in this zone",
      });
    }

    const updatedParkingSlot = await prisma.parking_slots.update({
      where: { id },
      data: {
        ...(finalSlotName && { slot_name: finalSlotName.trim() }),
        ...(zoneId && { zone_id: zoneId }),
        ...(status && { status }),
        ...(distanceToGate !== undefined && {
          distance_to_gate: Number(distanceToGate) || 0,
        }),
      },
    });

    return res.json({
      success: true,
      message: "Update parking slot successfully",
      data: updatedParkingSlot,
    });
  } catch (error) {
    console.error("Update parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot id",
      });
    }

    const parkingSlot = await prisma.parking_slots.findUnique({
      where: { id },
    });

    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found",
      });
    }

    const activeSessionCount = await prisma.parking_sessions.count({
      where: {
        OR: [{ parking_slot_id: id }, { assigned_slot_id: id }],
      },
    });

    if (activeSessionCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete parking slot because it is used by parking sessions",
      });
    }

    const reservationCount = await prisma.reservations.count({
      where: {
        parking_slot_id: id,
      },
    });

    if (reservationCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete parking slot because it is used by reservations",
      });
    }

    await prisma.parking_slots.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete parking slot successfully",
    });
  } catch (error) {
    console.error("Delete parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
