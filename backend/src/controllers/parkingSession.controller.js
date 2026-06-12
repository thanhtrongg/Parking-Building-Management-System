import prisma from "../config/prisma.js";
import {
    calculateParkingFee,
    getPricingPolicyForSession,
} from "../services/pricing.service.js";

const generateTicketCode = () => {
    return `TK-${Date.now()}`;
};

const PAYMENT_METHODS = ["CASH", "CARD", "SEPAY"];
const ACTIVE_RESERVATION_STATUSES = ["CONFIRMED", "CHECKED_IN"];

const isBlockedSlot = (slot) => {
    return !slot || ["OCCUPIED", "MAINTENANCE"].includes(slot.status);
};

export const getParkingSessions = async (req, res) => {
    try {
        const sessionRows = await prisma.$queryRaw`
            SELECT
                ps.id,
                ps.ticket_code AS "ticketCode",
                ps.license_plate AS "licensePlate",
                ps.vehicle_type_id AS "vehicleTypeId",
                ps.user_id AS "userId",
                ps.parking_slot_id AS "parkingSlotId",
                ps.entry_time AS "checkInTime",
                ps.entry_time AS "startTime",
                ps.exit_time AS "checkOutTime",
                ps.exit_time AS "endTime",
                ps.status,

                u.full_name AS "userFullName",
                u.phone AS "userPhone",

                vt.type_name AS "vehicleTypeName",

                COALESCE(assigned_slot.slot_name, slot.slot_name) AS "slotName",
                COALESCE(assigned_zone.zone_name, z.zone_name) AS "zoneName",
                slot.slot_name AS "reservedSlotName",
                z.zone_name AS "reservedZoneName",
                assigned_slot.id AS "assignedSlotId",
                assigned_slot.slot_name AS "assignedSlotName",
                assigned_zone.zone_name AS "assignedZoneName",

                p.id AS "paymentId",
                p.amount AS "paidAmount",
                p.payment_method AS "paymentMethod",
                p.payment_time AS "paymentTime",
                p.status AS "paymentStatus"
            FROM parking_sessions ps
            LEFT JOIN users u ON ps.user_id = u.id
            LEFT JOIN vehicle_types vt ON ps.vehicle_type_id = vt.id
            LEFT JOIN parking_slots slot ON ps.parking_slot_id = slot.id
            LEFT JOIN zones z ON slot.zone_id = z.id
            LEFT JOIN parking_slots assigned_slot ON ps.assigned_slot_id = assigned_slot.id
            LEFT JOIN zones assigned_zone ON assigned_slot.zone_id = assigned_zone.id
            LEFT JOIN LATERAL (
                SELECT id, amount, payment_method, payment_time, status
                FROM payments
                WHERE parking_session_id = ps.id
                ORDER BY payment_time DESC
                LIMIT 1
            ) p ON true
            ORDER BY ps.entry_time DESC
        `;

        const sessions = await Promise.all(sessionRows.map(async (session) => {
            const endTime = session.endTime ? new Date(session.endTime) : new Date();
            const pricingPolicy = await getPricingPolicyForSession(
                session.vehicleTypeId,
                session.startTime
            );
            const fee = calculateParkingFee(
                session.startTime,
                endTime,
                pricingPolicy
            );

            return {
                id: session.id,
                ticketCode: session.ticketCode,
                licensePlate: session.licensePlate,
                checkInTime: session.checkInTime,
                checkOutTime: session.checkOutTime,
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status,
                totalFee: fee.totalAmount,
                parkingHours: fee.parkingHours,
                basePrice: fee.basePrice,
                hourlyRate: fee.hourlyRate,
                nightRate: fee.nightRate,
                billableHourlyHours: fee.billableHourlyHours,
                billableNightHours: fee.billableNightHours,
                payment: session.paymentId
                    ? {
                        id: session.paymentId,
                        amount: Number(session.paidAmount || 0),
                        method: session.paymentMethod,
                        status: session.paymentStatus,
                        paidAt: session.paymentTime,
                    }
                    : null,
                user: session.userId
                    ? {
                        id: session.userId,
                        fullName: session.userFullName,
                        phone: session.userPhone,
                    }
                    : null,
                vehicleType: session.vehicleTypeId
                    ? {
                        id: session.vehicleTypeId,
                        typeName: session.vehicleTypeName,
                    }
                    : null,
                parkingSlot: session.parkingSlotId
                    ? {
                        id: session.parkingSlotId,
                        slotName: session.slotName,
                        zone: {
                            zoneName: session.zoneName,
                        },
                    }
                    : null,
                reservedSlot: session.parkingSlotId
                    ? {
                        id: session.parkingSlotId,
                        slotName: session.reservedSlotName,
                        zoneName: session.reservedZoneName,
                    }
                    : null,
                assignedSlot: session.assignedSlotId
                    ? {
                        id: session.assignedSlotId,
                        slotName: session.assignedSlotName,
                        zoneName: session.assignedZoneName,
                    }
                    : null,
            };
        }));

        return res.json({
            success: true,
            message: "Get parking sessions successfully",
            data: sessions,
        });
    } catch (error) {
        console.error("Get parking sessions error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getMyParkingSessions = async (req, res) => {
    try {
        const userId = req.user?.id;
        const status = req.query.status
            ? String(req.query.status).trim().toUpperCase()
            : "";
        const allowedStatuses = ["ACTIVE", "COMPLETED"];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found",
            });
        }

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status filter must be ACTIVE or COMPLETED",
            });
        }

        const sessions = await prisma.parking_sessions.findMany({
            where: {
                user_id: userId,
                ...(status ? { status } : {}),
            },
            include: {
                vehicle_types: {
                    select: {
                        type_name: true,
                    },
                },
                parking_slots_parking_sessions_parking_slot_idToparking_slots: {
                    select: {
                        id: true,
                        slot_name: true,
                        zones: {
                            select: {
                                zone_name: true,
                            },
                        },
                    },
                },
                parking_slots_parking_sessions_assigned_slot_idToparking_slots: {
                    select: {
                        id: true,
                        slot_name: true,
                        zones: {
                            select: {
                                zone_name: true,
                            },
                        },
                    },
                },
                payments: {
                    orderBy: {
                        payment_time: "desc",
                    },
                    take: 1,
                    select: {
                        status: true,
                        amount: true,
                        payment_method: true,
                        payment_time: true,
                    },
                },
            },
            orderBy: {
                entry_time: "desc",
            },
        });

        const mappedSessions = await Promise.all(sessions.map(async (session) => {
            const parkingSlot =
                session.parking_slots_parking_sessions_parking_slot_idToparking_slots;
            const assignedSlot =
                session.parking_slots_parking_sessions_assigned_slot_idToparking_slots;
            const actualSlot = assignedSlot || parkingSlot;
            const latestPayment = session.payments[0];
            const endTime = session.exit_time ? new Date(session.exit_time) : new Date();
            const pricingPolicy = await getPricingPolicyForSession(
                session.vehicle_type_id,
                session.entry_time
            );
            const fee = calculateParkingFee(
                session.entry_time,
                endTime,
                pricingPolicy
            );

            return {
                id: session.id,
                ticketCode: session.ticket_code,
                vehicleTypeName: session.vehicle_types?.type_name || null,
                licensePlate: session.license_plate,
                slotName: actualSlot?.slot_name || null,
                zoneName: actualSlot?.zones?.zone_name || null,
                reservedSlotName: parkingSlot?.slot_name || null,
                reservedZoneName: parkingSlot?.zones?.zone_name || null,
                assignedSlotName: assignedSlot?.slot_name || null,
                assignedZoneName: assignedSlot?.zones?.zone_name || null,
                entryTime: session.entry_time,
                exitTime: session.exit_time,
                status: session.status,
                paymentStatus: latestPayment?.status || "PENDING",
                paymentMethod: latestPayment?.payment_method || null,
                paidAt: latestPayment?.payment_time || null,
                paidAmount: latestPayment?.amount ? Number(latestPayment.amount) : 0,
                totalFee: fee.totalAmount,
                parkingHours: fee.parkingHours,
                basePrice: fee.basePrice,
                hourlyRate: fee.hourlyRate,
                nightRate: fee.nightRate,
                billableHourlyHours: fee.billableHourlyHours,
                billableNightHours: fee.billableNightHours,
            };
        }));

        return res.json({
            success: true,
            message: "Get my parking sessions successfully",
            data: mappedSessions,
        });
    } catch (error) {
        console.error("Get my parking sessions error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const checkInVehicle = async (req, res) => {
    try {
        const {
            userId,
            vehicleTypeId,
            parkingSlotId,
            assignedSlotId,
            reservationId,
            licensePlate,
            checkinStaffId,
        } = req.body;
        const finalCheckinStaffId = checkinStaffId || req.user?.id || null;

        const reservation = reservationId
            ? await prisma.reservations.findUnique({
                where: { id: reservationId },
                include: {
                    parking_slots: {
                        include: {
                            zones: true,
                        },
                    },
                },
            })
            : null;

        if (reservationId && !reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found",
            });
        }

        if (
            reservation &&
            !ACTIVE_RESERVATION_STATUSES.includes(reservation.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Only active reservations can be checked in",
            });
        }

        const finalUserId = reservation?.user_id || userId || null;
        const finalVehicleTypeId = reservation?.vehicle_type_id || vehicleTypeId;
        const reservedSlotId = reservation?.parking_slot_id || parkingSlotId;
        const actualSlotId = assignedSlotId || parkingSlotId || reservedSlotId;

        if (
            !finalVehicleTypeId ||
            !reservedSlotId ||
            !actualSlotId ||
            !licensePlate ||
            !finalCheckinStaffId
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const slot = await prisma.parking_slots.findUnique({
            where: {
                id: actualSlotId,
            },
            include: {
                zones: true,
            },
        });

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Parking slot not found",
            });
        }

        if (slot.zones?.vehicle_type_id && slot.zones.vehicle_type_id !== finalVehicleTypeId) {
            return res.status(400).json({
                success: false,
                message: "Assigned slot does not support this vehicle type",
            });
        }

        if (isBlockedSlot(slot)) {
            return res.status(400).json({
                success: false,
                message:
                    reservation && actualSlotId === reservedSlotId
                        ? "Reserved slot is unavailable. Please assign another available slot."
                        : "Parking slot unavailable",
            });
        }

        const activeSession = await prisma.parking_sessions.findFirst({
            where: {
                status: "ACTIVE",
                OR: [
                    { parking_slot_id: actualSlotId },
                    { assigned_slot_id: actualSlotId },
                    ...(reservation
                        ? [
                            {
                                user_id: reservation.user_id,
                                vehicle_type_id: reservation.vehicle_type_id,
                                parking_slot_id: reservedSlotId,
                            },
                        ]
                        : []),
                ],
            },
        });

        if (activeSession) {
            return res.status(409).json({
                success: false,
                message: "Parking slot already has an active session",
            });
        }

        const session = await prisma.$transaction(async (tx) => {
            const createdSession = await tx.parking_sessions.create({
                data: {
                    ticket_code: generateTicketCode(),
                    license_plate: licensePlate.trim().toUpperCase(),

                    user_id: finalUserId,
                    vehicle_type_id: finalVehicleTypeId,
                    parking_slot_id: reservedSlotId,
                    ...(actualSlotId !== reservedSlotId && {
                        assigned_slot_id: actualSlotId,
                    }),

                    checkin_staff_id: finalCheckinStaffId,

                    entry_time: new Date(),

                    status: "ACTIVE",
                },
            });

            await tx.parking_slots.update({
                where: {
                    id: actualSlotId,
                },
                data: {
                    status: "OCCUPIED",
                },
            });

            if (reservation) {
                await tx.reservations.update({
                    where: {
                        id: reservation.id,
                    },
                    data: {
                        status: "CHECKED_IN",
                        ...(assignedSlotId && { parking_slot_id: reservedSlotId }),
                    },
                });
            }

            return createdSession;
        });

        return res.status(201).json({
            success: true,
            message: "Check in successful",
            data: session,
        });
    } catch (error) {
        console.error("Check in error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getParkingSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await prisma.parking_sessions.findUnique({
            where: { id },
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Parking session not found",
            });
        }

        return res.json({
            success: true,
            data: session,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const checkOutVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkOutStaffId, paymentMethod = "CASH" } = req.body;
        const normalizedPaymentMethod = String(paymentMethod).toUpperCase();
        const finalCheckOutStaffId = checkOutStaffId || req.user?.id || null;

        if (!PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }

        const session = await prisma.parking_sessions.findUnique({
            where: { id },
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Parking session not found",
            });
        }

        if (session.status === "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Parking session has already been completed",
            });
        }

        const checkOutTime = new Date();

        const pricingPolicy = await getPricingPolicyForSession(
            session.vehicle_type_id,
            session.entry_time
        );

        if (!pricingPolicy) {
            return res.status(400).json({
                success: false,
                message: "Pricing policy not found for this vehicle type",
            });
        }

        const fee = calculateParkingFee(
            session.entry_time,
            checkOutTime,
            pricingPolicy
        );

        const payment = await prisma.$transaction(async (tx) => {
            await tx.parking_sessions.update({
                where: { id },
                data: {
                    exit_time: checkOutTime,
                    checkout_staff_id: finalCheckOutStaffId,
                    status: "COMPLETED",
                },
            });

            const actualSlotId = session.assigned_slot_id || session.parking_slot_id;

            if (actualSlotId) {
                await tx.parking_slots.update({
                    where: {
                        id: actualSlotId,
                    },
                    data: {
                        status: "AVAILABLE",
                    },
                });
            }

            if (session.user_id && session.vehicle_type_id) {
                await tx.reservations.updateMany({
                    where: {
                        user_id: session.user_id,
                        vehicle_type_id: session.vehicle_type_id,
                        status: "CHECKED_IN",
                        OR: [
                            { parking_slot_id: session.parking_slot_id },
                            { parking_slot_id: session.assigned_slot_id || session.parking_slot_id },
                        ],
                    },
                    data: {
                        status: "COMPLETED",
                    },
                });
            }

            return tx.payments.create({
                data: {
                    parking_session_id: id,
                    amount: fee.totalAmount,
                    payment_method: normalizedPaymentMethod,
                    status: "SUCCESS",
                    payment_time: checkOutTime,
                },
            });
        });

        return res.json({
            success: true,
            totalAmount: fee.totalAmount,
            parkingHours: fee.parkingHours,
            billableHourlyHours: fee.billableHourlyHours,
            billableNightHours: fee.billableNightHours,
            payment: {
                id: payment.id,
                amount: Number(payment.amount),
                method: payment.payment_method,
                status: payment.status,
                paidAt: payment.payment_time,
            },
        });
    } catch (error) {
        console.error("Check out error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
