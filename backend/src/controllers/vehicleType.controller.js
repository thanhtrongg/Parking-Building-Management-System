import prisma from "../config/prisma.js";

export const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await prisma.$queryRaw`
      SELECT 
        id,
        type_name AS "typeName",
        description
      FROM vehicle_types
      ORDER BY type_name ASC
    `;

    return res.json({
      success: true,
      message: "Get vehicle types successfully",
      data: vehicleTypes,
    });
  } catch (error) {
    console.error("Get vehicle types error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
