import prisma from "../config/prisma.js";

const generateTicketCode = () => {
    return `TK-${Date.now()}`;
};

const BASE_PRICE_HOURS = 2;
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;

const toNumber = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback;

    const number = Number(value);

    return Number.isNaN(number) ? fallback : number;
};

const getPricingPolicyForSession = async (
    vehicleTypeId,
    checkInTime
) => {
    const effectiveDate = new Date(checkInTime);

    const vehicleTypePolicy = vehicleTypeId
        ? await prisma.pricing_policies.findFirst({
            where: {
                vehicle_type_id: vehicleTypeId,
                effective_date: {
                    lte: effectiveDate,
                },
            },
            orderBy: {
                effective_date: "desc",
            },
        })
        : null;

    if (vehicleTypePolicy) return vehicleTypePolicy;

    return prisma.pricing_policies.findFirst({
        where: {
            vehicle_type_id: null,
            effective_date: {
                lte: effectiveDate,
            },
        },
        orderBy: {
            effective_date: "desc",
        },
    });
};

const isNightHour = (date) => {
    const hour = date.getHours();

    return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
};

const calculateParkingFee = (
    checkInTime,
    checkOutTime,
    pricingPolicy
) => {
    if (!pricingPolicy) {
        return {
            totalAmount: 0,
            parkingHours: calculateParkingHours(checkInTime, checkOutTime),
            basePrice: 0,
            hourlyRate: 0,
            nightRate: 0,
            billableHourlyHours: 0,
            billableNightHours: 0,
        };
    }

    const parkingHours = calculateParkingHours(checkInTime, checkOutTime);
    const basePrice = toNumber(pricingPolicy.base_price);
    const hourlyRate = toNumber(pricingPolicy.hourly_rate);
    const nightRate = toNumber(pricingPolicy.night_rate, hourlyRate);

    let billableHourlyHours = 0;
    let billableNightHours = 0;
    const checkInDate = new Date(checkInTime);

    for (let hourIndex = BASE_PRICE_HOURS; hourIndex < parkingHours; hourIndex += 1) {
        const hourStart = new Date(checkInDate);
        hourStart.setHours(checkInDate.getHours() + hourIndex);

        if (isNightHour(hourStart)) {
            billableNightHours += 1;
        } else {
            billableHourlyHours += 1;
        }
    }

    const totalAmount =
        basePrice +
        billableHourlyHours * hourlyRate +
        billableNightHours * nightRate;

    return {
        totalAmount,
        parkingHours,
        basePrice,
        hourlyRate,
        nightRate,
        billableHourlyHours,
        billableNightHours,
    };
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

                slot.slot_name AS "slotName",
                z.zone_name AS "zoneName"
            FROM parking_sessions ps
            LEFT JOIN users u ON ps.user_id = u.id
            LEFT JOIN vehicle_types vt ON ps.vehicle_type_id = vt.id
            LEFT JOIN parking_slots slot ON ps.parking_slot_id = slot.id
            LEFT JOIN zones z ON slot.zone_id = z.id
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
                    },
                },
            },
            orderBy: {
                entry_time: "desc",
            },
        });

        return res.json({
            success: true,
            message: "Get my parking sessions successfully",
            data: sessions.map((session) => {
                const parkingSlot =
                    session.parking_slots_parking_sessions_parking_slot_idToparking_slots;
                const latestPayment = session.payments[0];

                return {
                    id: session.id,
                    ticketCode: session.ticket_code,
                    vehicleTypeName: session.vehicle_types?.type_name || null,
                    licensePlate: session.license_plate,
                    slotName: parkingSlot?.slot_name || null,
                    zoneName: parkingSlot?.zones?.zone_name || null,
                    entryTime: session.entry_time,
                    exitTime: session.exit_time,
                    status: session.status,
                    paymentStatus: latestPayment?.status || "PENDING",
                };
            }),
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

        await prisma.parking_sessions.update({
            where: { id },
            data: {
                exit_time: checkOutTime,

                checkout_staff_id: checkOutStaffId,

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
            totalAmount: fee.totalAmount,
            parkingHours: fee.parkingHours,
            billableHourlyHours: fee.billableHourlyHours,
            billableNightHours: fee.billableNightHours,
        });
    } catch (error) {
        console.error("Check out error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
