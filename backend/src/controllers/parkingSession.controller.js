import prisma from "../config/prisma.js";

const generateTicketCode = () => {
    return `TK-${Date.now()}`;
};

export const getParkingSessions = async (req, res) => {
    try {
        const sessions = await prisma.$queryRaw`
            SELECT
                ps.id,
                ps.ticket_code AS "ticketCode",
                ps.license_plate AS "licensePlate",
                ps.entry_time AS "checkInTime",
                ps.exit_time AS "checkOutTime",
                ps.status
            FROM parking_sessions ps
            ORDER BY ps.entry_time DESC
        `;

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

const calculateParkingHours = (
    checkInTime,
    checkOutTime
) => {
    const diffMs =
        checkOutTime - new Date(checkInTime);

    return Math.max(
        1,
        Math.ceil(diffMs / (1000 * 60 * 60))
    );
};

export const checkOutVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkOutStaffId } = req.body;

        const session = await prisma.parking_sessions.findUnique({
            where: { id },
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Parking session not found",
            });
        }

        const checkOutTime = new Date();

        const parkingHours = calculateParkingHours(
            session.entry_time,
            checkOutTime
        );

        const totalAmount = parkingHours * 10000;

        await prisma.parking_sessions.update({
            where: { id },
            data: {
                exit_time: checkOutTime,

                checkout_staff_id: checkOutStaffId,

                total_amount: totalAmount,

                status: "COMPLETED",
            },
        });

        await prisma.parking_slots.update({
            where: {
                id: session.parking_slot_id,
            },
            data: {
                status: "AVAILABLE",
            },
        });

        return res.json({
            success: true,
            totalAmount,
            parkingHours,
        });
    } catch (error) {
        console.error("Check out error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
