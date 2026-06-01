import prisma from "../config/prisma.js";

export const getReservations = async (req, res) => {
  try {
    const reservations = await prisma.$queryRaw`
      SELECT
        r.id,
        r.expected_start_time AS "expectedStartTime",
        r.expected_end_time AS "expectedEndTime",
        r.status,
        r.created_at AS "createdAt",

        u.id AS "userId",
        u.full_name AS "fullName",
        u.email,
        u.phone,

        vt.id AS "vehicleTypeId",
        vt.type_name AS "vehicleTypeName",

        ps.id AS "parkingSlotId",
        ps.slot_name AS "slotName",

        z.id AS "zoneId",
        z.zone_name AS "zoneName"
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN vehicle_types vt ON r.vehicle_type_id = vt.id
      LEFT JOIN parking_slots ps ON r.parking_slot_id = ps.id
      LEFT JOIN zones z ON ps.zone_id = z.id
      ORDER BY r.created_at DESC
    `;

    return res.json({
      success: true,
      message: "Get reservations successfully",
      data: reservations,
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
