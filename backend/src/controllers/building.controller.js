import prisma from "../config/prisma.js";
import { isValidUUID } from "../utils/validation.js";

function mapBuilding(building) {
  return {
    id: building.id,
    buildingCode: building.building_code,
    buildingName: building.building_name,
    address: building.address,
    description: building.description,
    status: building.status,
    createdAt: building.created_at,
    updatedAt: building.updated_at,
    floorCount: building._count?.building_floors ?? 0,
    gateCount: building._count?.building_gates ?? 0,
  };
}

export const getBuildings = async (req, res) => {
  try {
    const buildings = await prisma.buildings.findMany({
      include: {
        _count: {
          select: {
            building_floors: true,
            building_gates: true,
          },
        },
      },
      orderBy: [
        { building_name: "asc" },
        { created_at: "desc" },
      ],
    });

    return res.json({
      success: true,
      message: "Get buildings successfully",
      data: buildings.map(mapBuilding),
    });
  } catch (error) {
    console.error("Get buildings error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createBuilding = async (req, res) => {
  try {
    const { buildingCode, buildingName, address, description, status = "ACTIVE" } =
      req.body;

    if (!buildingCode?.trim() || !buildingName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Building code and building name are required",
      });
    }

    const existingBuilding = await prisma.buildings.findUnique({
      where: {
        building_code: buildingCode.trim().toUpperCase(),
      },
    });

    if (existingBuilding) {
      return res.status(409).json({
        success: false,
        message: "Building code already exists",
      });
    }

    const building = await prisma.buildings.create({
      data: {
        building_code: buildingCode.trim().toUpperCase(),
        building_name: buildingName.trim(),
        address: address?.trim() || null,
        description: description?.trim() || null,
        status: status?.trim() || "ACTIVE",
      },
      include: {
        _count: {
          select: {
            building_floors: true,
            building_gates: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create building successfully",
      data: mapBuilding(building),
    });
  } catch (error) {
    console.error("Create building error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { buildingCode, buildingName, address, description, status } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building id",
      });
    }

    if (!buildingCode?.trim() || !buildingName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Building code and building name are required",
      });
    }

    const building = await prisma.buildings.findUnique({
      where: { id },
    });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    const duplicate = await prisma.buildings.findUnique({
      where: {
        building_code: buildingCode.trim().toUpperCase(),
      },
    });

    if (duplicate && duplicate.id !== id) {
      return res.status(409).json({
        success: false,
        message: "Building code already exists",
      });
    }

    const updated = await prisma.buildings.update({
      where: { id },
      data: {
        building_code: buildingCode.trim().toUpperCase(),
        building_name: buildingName.trim(),
        address: address?.trim() || null,
        description: description?.trim() || null,
        status: status?.trim() || "ACTIVE",
        updated_at: new Date(),
      },
      include: {
        _count: {
          select: {
            building_floors: true,
            building_gates: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Update building successfully",
      data: mapBuilding(updated),
    });
  } catch (error) {
    console.error("Update building error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building id",
      });
    }

    const building = await prisma.buildings.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            building_floors: true,
            building_gates: true,
          },
        },
      },
    });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    if (building._count.building_floors > 0 || building._count.building_gates > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete building because it still contains floors or gates",
      });
    }

    await prisma.buildings.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete building successfully",
    });
  } catch (error) {
    console.error("Delete building error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
