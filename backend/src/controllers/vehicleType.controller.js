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

export const createVehicleType = async (req, res) => {
  try {
    const { typeName, description } = req.body;

    if (!typeName || typeName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vehicle type name is required",
      });
    }

    const existingVehicleType = await prisma.vehicle_types.findUnique({
      where: {
        type_name: typeName.trim(),
      },
    });

    if (existingVehicleType) {
      return res.status(409).json({
        success: false,
        message: "Vehicle type name already exists",
      });
    }

    const newVehicleType = await prisma.vehicle_types.create({
      data: {
        type_name: typeName.trim(),
        description: description?.trim() || null,
      },
      select: {
        id: true,
        type_name: true,
        description: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create vehicle type successfully",
      data: {
        id: newVehicleType.id,
        typeName: newVehicleType.type_name,
        description: newVehicleType.description,
      },
    });
  } catch (error) {
    console.error("Create vehicle type error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    const { typeName, description } = req.body;

    if (!typeName || typeName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vehicle type name is required",
      });
    }

    const vehicleType = await prisma.vehicle_types.findUnique({
      where: {
        id,
      },
    });

    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    const duplicateVehicleType = await prisma.vehicle_types.findUnique({
      where: {
        type_name: typeName.trim(),
      },
    });

    if (duplicateVehicleType && duplicateVehicleType.id !== id) {
      return res.status(409).json({
        success: false,
        message: "Vehicle type name already exists",
      });
    }

    const updatedVehicleType = await prisma.vehicle_types.update({
      where: {
        id,
      },
      data: {
        type_name: typeName.trim(),
        description: description?.trim() || null,
      },
      select: {
        id: true,
        type_name: true,
        description: true,
      },
    });

    return res.json({
      success: true,
      message: "Update vehicle type successfully",
      data: {
        id: updatedVehicleType.id,
        typeName: updatedVehicleType.type_name,
        description: updatedVehicleType.description,
      },
    });
  } catch (error) {
    console.error("Update vehicle type error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteVehicleType = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicleType = await prisma.vehicle_types.findUnique({
      where: {
        id,
      },
      include: {
        zones: true,
        reservations: true,
        parking_sessions: true,
        pricing_policies: true,
      },
    });

    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    const isBeingUsed =
      vehicleType.zones.length > 0 ||
      vehicleType.reservations.length > 0 ||
      vehicleType.parking_sessions.length > 0 ||
      vehicleType.pricing_policies.length > 0;

    if (isBeingUsed) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete vehicle type because it is being used by zones, reservations, parking sessions, or pricing policies",
      });
    }

    await prisma.vehicle_types.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Delete vehicle type successfully",
    });
  } catch (error) {
    console.error("Delete vehicle type error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
