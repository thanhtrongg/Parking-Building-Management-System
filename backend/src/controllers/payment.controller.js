import prisma from "../config/prisma.js";

export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.$queryRaw`
      SELECT
        p.id,
        p.amount,
        p.payment_method AS "paymentMethod",
        p.payment_time AS "paymentTime",
        p.status,

        ps.id AS "parkingSessionId",
        ps.ticket_code AS "ticketCode",
        ps.license_plate AS "licensePlate",
        ps.entry_time AS "entryTime",
        ps.exit_time AS "exitTime",
        ps.status AS "sessionStatus",

        u.id AS "userId",
        u.full_name AS "fullName",
        u.email,
        u.phone,

        vt.id AS "vehicleTypeId",
        vt.type_name AS "vehicleTypeName",

        slot.id AS "parkingSlotId",
        slot.slot_name AS "slotName",

        z.id AS "zoneId",
        z.zone_name AS "zoneName"
      FROM payments p
      LEFT JOIN parking_sessions ps ON p.parking_session_id = ps.id
      LEFT JOIN users u ON ps.user_id = u.id
      LEFT JOIN vehicle_types vt ON ps.vehicle_type_id = vt.id
      LEFT JOIN parking_slots slot ON ps.parking_slot_id = slot.id
      LEFT JOIN zones z ON slot.zone_id = z.id
      ORDER BY p.payment_time DESC
    `;

    return res.json({
      success: true,
      message: "Get payments successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
