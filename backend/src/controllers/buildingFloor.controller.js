import prisma from "../config/prisma.js";
import { isValidUUID } from "../utils/validation.js";

function mapFloor(floor) {
  return {
    id: floor.id,
    buildingId: floor.building_id,
    buildingCode: floor.buildings?.building_code || null,
    buildingName: floor.buildings?.building_name || null,
    floorCode: floor.floor_code,
    floorName: floor.floor_name,
    levelNumber: floor.level_number,
    description: floor.description,
    status: floor.status,
    createdAt: floor.created_at,
    updatedAt: floor.updated_at,
    zoneCount: floor._count?.zones ?? 0,
  };
}

export const getBuildingFloors = async (req, res) => {
  try {
    const { buildingId } = req.query;

    if (buildingId && !isValidUUID(buildingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid buildingId",
      });
    }

    const floors = await prisma.building_floors.findMany({
      where: {
        ...(buildingId ? { building_id: buildingId } : {}),
      },
      include: {
        buildings: true,
        _count: {
          select: {
            zones: true,
          },
        },
      },
      orderBy: [{ level_number: "asc" }, { floor_name: "asc" }],
    });

    return res.json({
      success: true,
      message: "Get building floors successfully",
      data: floors.map(mapFloor),
    });
  } catch (error) {
    console.error("Get building floors error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createBuildingFloor = async (req, res) => {
  try {
    const {
      buildingId,
      floorCode,
      floorName,
      levelNumber,
      description,
      status = "ACTIVE",
    } = req.body;

    if (
      !isValidUUID(buildingId) ||
      !floorCode?.trim() ||
      !floorName?.trim() ||
      levelNumber === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Building, floor code, floor name, and level number are required",
      });
    }

    const building = await prisma.buildings.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    const normalizedFloorCode = floorCode.trim().toUpperCase();
    const parsedLevelNumber = Number(levelNumber);

    const duplicate = await prisma.building_floors.findFirst({
      where: {
        building_id: buildingId,
        OR: [
          { floor_code: normalizedFloorCode },
          { level_number: parsedLevelNumber },
        ],
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Floor code or level number already exists in this building",
      });
    }

    const floor = await prisma.building_floors.create({
      data: {
        building_id: buildingId,
        floor_code: normalizedFloorCode,
        floor_name: floorName.trim(),
        level_number: parsedLevelNumber,
        description: description?.trim() || null,
        status: status?.trim() || "ACTIVE",
      },
      include: {
        buildings: true,
        _count: {
          select: {
            zones: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create building floor successfully",
      data: mapFloor(floor),
    });
  } catch (error) {
    console.error("Create building floor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBuildingFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      buildingId,
      floorCode,
      floorName,
      levelNumber,
      description,
      status,
    } = req.body;

    if (!isValidUUID(id) || !isValidUUID(buildingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid floor id or building id",
      });
    }

    const existingFloor = await prisma.building_floors.findUnique({
      where: { id },
    });

    if (!existingFloor) {
      return res.status(404).json({
        success: false,
        message: "Building floor not found",
      });
    }

    const building = await prisma.buildings.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    const normalizedFloorCode = floorCode.trim().toUpperCase();
    const parsedLevelNumber = Number(levelNumber);

    const duplicate = await prisma.building_floors.findFirst({
      where: {
        building_id: buildingId,
        OR: [
          { floor_code: normalizedFloorCode },
          { level_number: parsedLevelNumber },
        ],
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Floor code or level number already exists in this building",
      });
    }

    const updated = await prisma.building_floors.update({
      where: { id },
      data: {
        building_id: buildingId,
        floor_code: normalizedFloorCode,
        floor_name: floorName.trim(),
        level_number: parsedLevelNumber,
        description: description?.trim() || null,
        status: status?.trim() || "ACTIVE",
        updated_at: new Date(),
      },
      include: {
        buildings: true,
        _count: {
          select: {
            zones: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Update building floor successfully",
      data: mapFloor(updated),
    });
  } catch (error) {
    console.error("Update building floor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBuildingFloor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid floor id",
      });
    }

    const floor = await prisma.building_floors.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            zones: true,
          },
        },
      },
    });

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Building floor not found",
      });
    }

    if (floor._count.zones > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete floor because it still contains parking zones",
      });
    }

    await prisma.building_floors.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete building floor successfully",
    });
  } catch (error) {
    console.error("Delete building floor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
