import prisma from "../config/prisma.js";
import { isValidUUID } from "../utils/validation.js";

function mapGate(gate) {
  return {
    id: gate.id,
    buildingId: gate.building_id,
    buildingCode: gate.buildings?.building_code || null,
    buildingName: gate.buildings?.building_name || null,
    gateCode: gate.gate_code,
    gateName: gate.gate_name,
    gateType: gate.gate_type,
    locationDescription: gate.location_description,
    status: gate.status,
    createdAt: gate.created_at,
    updatedAt: gate.updated_at,
    slotCount: gate._count?.parking_slots ?? 0,
  };
}

export const getBuildingGates = async (req, res) => {
  try {
    const { buildingId } = req.query;

    if (buildingId && !isValidUUID(buildingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid buildingId",
      });
    }

    const gates = await prisma.building_gates.findMany({
      where: {
        ...(buildingId ? { building_id: buildingId } : {}),
      },
      include: {
        buildings: true,
        _count: {
          select: {
            parking_slots: true,
          },
        },
      },
      orderBy: [{ gate_name: "asc" }, { gate_code: "asc" }],
    });

    return res.json({
      success: true,
      message: "Get building gates successfully",
      data: gates.map(mapGate),
    });
  } catch (error) {
    console.error("Get building gates error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createBuildingGate = async (req, res) => {
  try {
    const {
      buildingId,
      gateCode,
      gateName,
      gateType = "ENTRY",
      locationDescription,
      status = "ACTIVE",
    } = req.body;

    if (!isValidUUID(buildingId) || !gateCode?.trim() || !gateName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Building, gate code, and gate name are required",
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

    const normalizedGateCode = gateCode.trim().toUpperCase();

    const duplicate = await prisma.building_gates.findFirst({
      where: {
        building_id: buildingId,
        gate_code: normalizedGateCode,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Gate code already exists in this building",
      });
    }

    const gate = await prisma.building_gates.create({
      data: {
        building_id: buildingId,
        gate_code: normalizedGateCode,
        gate_name: gateName.trim(),
        gate_type: gateType.trim().toUpperCase(),
        location_description: locationDescription?.trim() || null,
        status: status?.trim() || "ACTIVE",
      },
      include: {
        buildings: true,
        _count: {
          select: {
            parking_slots: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create building gate successfully",
      data: mapGate(gate),
    });
  } catch (error) {
    console.error("Create building gate error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBuildingGate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      buildingId,
      gateCode,
      gateName,
      gateType,
      locationDescription,
      status,
    } = req.body;

    if (!isValidUUID(id) || !isValidUUID(buildingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gate id or building id",
      });
    }

    const gate = await prisma.building_gates.findUnique({
      where: { id },
    });

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Building gate not found",
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

    const normalizedGateCode = gateCode.trim().toUpperCase();

    const duplicate = await prisma.building_gates.findFirst({
      where: {
        building_id: buildingId,
        gate_code: normalizedGateCode,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Gate code already exists in this building",
      });
    }

    const updated = await prisma.building_gates.update({
      where: { id },
      data: {
        building_id: buildingId,
        gate_code: normalizedGateCode,
        gate_name: gateName.trim(),
        gate_type: gateType.trim().toUpperCase(),
        location_description: locationDescription?.trim() || null,
        status: status?.trim() || "ACTIVE",
        updated_at: new Date(),
      },
      include: {
        buildings: true,
        _count: {
          select: {
            parking_slots: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Update building gate successfully",
      data: mapGate(updated),
    });
  } catch (error) {
    console.error("Update building gate error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBuildingGate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gate id",
      });
    }

    const gate = await prisma.building_gates.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            parking_slots: true,
          },
        },
      },
    });

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: "Building gate not found",
      });
    }

    if (gate._count.parking_slots > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete gate because it is still referenced by parking slots",
      });
    }

    await prisma.building_gates.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete building gate successfully",
    });
  } catch (error) {
    console.error("Delete building gate error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
