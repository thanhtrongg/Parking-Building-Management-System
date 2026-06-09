import prisma from "../config/prisma.js";
import {
    calculateParkingFee,
    getPricingPolicyForSession,
} from "../services/pricing.service.js";

const generateTicketCode = () => {
    return `TK-${Date.now()}`;
};

const PAYMENT_METHODS = ["CASH", "CARD", "SEPAY"];

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

                slot.slot_name AS "slotName",
                z.zone_name AS "zoneName",

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

export const checkInVehicle = async (req, res) => {
    try {
        const {
            userId,
            vehicleTypeId,
            parkingSlotId,
            licensePlate,
            checkinStaffId,
        } = req.body;

        if (
            !vehicleTypeId ||
            !parkingSlotId ||
            !licensePlate ||
            !checkinStaffId
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const slot = await prisma.parking_slots.findUnique({
            where: {
                id: parkingSlotId,
            },
        });

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Parking slot not found",
            });
        }

        if (
            slot.status === "OCCUPIED" ||
            slot.status === "MAINTENANCE"
        ) {
            return res.status(400).json({
                success: false,
                message: "Parking slot unavailable",
            });
        }

        const session = await prisma.parking_sessions.create({
            data: {
                ticket_code: generateTicketCode(),
                license_plate: licensePlate,

                user_id: userId,
                vehicle_type_id: vehicleTypeId,
                parking_slot_id: parkingSlotId,

                checkin_staff_id: checkinStaffId,

                entry_time: new Date(),

                status: "ACTIVE",
            },
        });

        await prisma.parking_slots.update({
            where: {
                id: parkingSlotId,
            },
            data: {
                status: "OCCUPIED",
            },
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

            if (session.parking_slot_id) {
                await tx.parking_slots.update({
                    where: {
                        id: session.parking_slot_id,
                    },
                    data: {
                        status: "AVAILABLE",
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
