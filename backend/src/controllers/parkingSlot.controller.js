import prisma from "../config/prisma.js";

export const getParkingSlots = async (req, res) => {
  try {
    const parkingSlots = await prisma.$queryRaw`
      SELECT
        ps.id,
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
