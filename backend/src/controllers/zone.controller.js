import prisma from "../config/prisma.js";
import { isValidUUID } from "../utils/validation.js";

function mapZone(zone) {
  return {
    id: zone.id,
    zoneName: zone.zone_name,
    totalCapacity: zone.total_capacity,
    floorId: zone.floor_id,
    floorCode: zone.building_floors?.floor_code || null,
    floorName: zone.building_floors?.floor_name || null,
    levelNumber: zone.building_floors?.level_number ?? null,
    buildingId: zone.building_floors?.buildings?.id || null,
    buildingCode: zone.building_floors?.buildings?.building_code || null,
    buildingName: zone.building_floors?.buildings?.building_name || null,
    vehicleTypeId: zone.vehicle_types?.id || zone.vehicle_type_id || null,
    vehicleTypeName: zone.vehicle_types?.type_name || null,
    vehicleTypeDescription: zone.vehicle_types?.description || null,
  };
}

export const getZones = async (req, res) => {
  try {
    const { buildingId, floorId } = req.query;

    if (buildingId && !isValidUUID(buildingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid buildingId",
      });
    }

    if (floorId && !isValidUUID(floorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid floorId",
      });
    }

    const zones = await prisma.zones.findMany({
      where: {
        ...(floorId ? { floor_id: floorId } : {}),
        ...(buildingId
          ? {
              building_floors: {
                is: {
                  building_id: buildingId,
                },
              },
            }
          : {}),
      },
      include: {
        vehicle_types: true,
        building_floors: {
          include: {
            buildings: true,
          },
        },
      },
      orderBy: [{ zone_name: "asc" }],
    });

    return res.json({
      success: true,
      message: "Get zones successfully",
      data: zones.map(mapZone),
    });
  } catch (error) {
    console.error("Get zones error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createZone = async (req, res) => {
  try {
    const { zoneName, vehicleTypeId, totalCapacity, floorId } = req.body;

    if (!zoneName || !vehicleTypeId || !totalCapacity || !floorId) {
      return res.status(400).json({
        success: false,
        message: "Zone name, vehicle type, floor, and capacity are required",
      });
    }

    if (!isValidUUID(vehicleTypeId) || !isValidUUID(floorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle type or floor id",
      });
    }

    const [vehicleType, floor] = await Promise.all([
      prisma.vehicle_types.findUnique({
        where: {
          id: vehicleTypeId,
        },
      }),
      prisma.building_floors.findUnique({
        where: {
          id: floorId,
        },
      }),
    ]);

    if (!vehicleType) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    if (!floor) {
      return res.status(400).json({
        success: false,
        message: "Floor not found",
      });
    }

    const zone = await prisma.zones.create({
      data: {
        zone_name: zoneName.trim(),
        vehicle_type_id: vehicleTypeId,
        total_capacity: Number(totalCapacity),
        floor_id: floorId,
      },
      include: {
        vehicle_types: true,
        building_floors: {
          include: {
            buildings: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create zone successfully",
      data: mapZone(zone),
    });
  } catch (error) {
    console.error("Create zone error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { zoneName, vehicleTypeId, totalCapacity, floorId } = req.body;

    if (!isValidUUID(id) || !isValidUUID(vehicleTypeId) || !isValidUUID(floorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zone, vehicle type, or floor id",
      });
    }

    const zone = await prisma.zones.findUnique({
      where: { id },
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found",
      });
    }

    const [vehicleType, floor] = await Promise.all([
      prisma.vehicle_types.findUnique({
        where: {
          id: vehicleTypeId,
        },
      }),
      prisma.building_floors.findUnique({
        where: {
          id: floorId,
        },
      }),
    ]);

    if (!vehicleType) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    if (!floor) {
      return res.status(400).json({
        success: false,
        message: "Floor not found",
      });
    }

    const updatedZone = await prisma.zones.update({
      where: { id },
      data: {
        zone_name: zoneName.trim(),
        vehicle_type_id: vehicleTypeId,
        total_capacity: Number(totalCapacity),
        floor_id: floorId,
      },
      include: {
        vehicle_types: true,
        building_floors: {
          include: {
            buildings: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Update zone successfully",
      data: mapZone(updatedZone),
    });
  } catch (error) {
    console.error("Update zone error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await prisma.zones.findUnique({
      where: { id },
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found",
      });
    }

    const slotCount = await prisma.parking_slots.count({
      where: {
        zone_id: id,
      },
    });

    if (slotCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete zone because it still contains parking slots",
      });
    }

    await prisma.zones.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete zone successfully",
    });
  } catch (error) {
    console.error("Delete zone error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
