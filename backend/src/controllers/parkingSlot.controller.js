import prisma from "../config/prisma.js";
import {
  isValidUUID,
  normalizeBooleanInput,
  parseOptionalBoolean,
} from "../utils/validation.js";

const VALID_SLOT_STATUSES = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "MAINTENANCE",
];
const RESERVATION_HOLD_WINDOW_MINUTES = 15;

const isValidDate = (date) => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};

function mapParkingSlot(slot) {
  const zone = slot.zones;
  const floor = zone?.building_floors;
  const building = floor?.buildings;
  const gate = slot.building_gates;

  return {
    id: slot.id,
    slotNumber: slot.slot_name,
    slotName: slot.slot_name,
    status: slot.status,
    distanceToGate: slot.distance_to_gate,
    nearElevator: Boolean(slot.near_elevator),
    nearExit: Boolean(slot.near_exit),
    nearEntryGate: Boolean(slot.near_entry_gate),
    nearExitGate: Boolean(slot.near_exit_gate),
    zoneId: slot.zone_id,
    zoneName: zone?.zone_name || null,
    totalCapacity: zone?.total_capacity ?? null,
    floorId: floor?.id || null,
    floorCode: floor?.floor_code || null,
    floorName: floor?.floor_name || null,
    levelNumber: floor?.level_number ?? null,
    buildingId: building?.id || null,
    buildingCode: building?.building_code || null,
    buildingName: building?.building_name || null,
    vehicleTypeId: zone?.vehicle_type_id || null,
    vehicleTypeName: zone?.vehicle_types?.type_name || null,
    nearestGateId: slot.nearest_gate_id || null,
    nearestGateCode: gate?.gate_code || null,
    nearestGateName: gate?.gate_name || null,
    nearestGateType: gate?.gate_type || null,
  };
}

async function findZoneById(zoneId) {
  return prisma.zones.findUnique({
    where: { id: zoneId },
    include: {
      building_floors: {
        include: {
          buildings: true,
        },
      },
    },
  });
}

async function findGateById(gateId) {
  if (!gateId) return null;

  return prisma.building_gates.findUnique({
    where: { id: gateId },
    include: {
      buildings: true,
    },
  });
}

export const getAvailableParkingSlotsForReservation = async (req, res) => {
  try {
    const { vehicleTypeId, startTime, endTime, buildingId, floorId } = req.query;

    if (vehicleTypeId && !isValidUUID(vehicleTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicleTypeId",
      });
    }

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

    const parsedStartTime = startTime ? new Date(startTime) : null;
    const parsedEndTime = endTime
      ? new Date(endTime)
      : parsedStartTime
        ? new Date(
            parsedStartTime.getTime() +
              RESERVATION_HOLD_WINDOW_MINUTES * 60 * 1000,
          )
        : null;

    if (
      (startTime && !isValidDate(parsedStartTime)) ||
      (endTime && !isValidDate(parsedEndTime))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid startTime or endTime",
      });
    }

    if (parsedStartTime && parsedEndTime && parsedStartTime >= parsedEndTime) {
      return res.status(400).json({
        success: false,
        message: "startTime must be before endTime",
      });
    }

    const zoneFilter = {
      ...(vehicleTypeId ? { vehicle_type_id: vehicleTypeId } : {}),
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
    };

    const parkingSlots = await prisma.parking_slots.findMany({
      where: {
        status: "AVAILABLE",
        ...(Object.keys(zoneFilter).length > 0 && {
          zones: {
            is: zoneFilter,
          },
        }),
        ...(parsedStartTime &&
          parsedEndTime && {
            reservations: {
              none: {
                status: {
                  in: ["CONFIRMED", "CHECKED_IN"],
                },
                expected_start_time: {
                  lt: parsedEndTime,
                },
                expected_end_time: {
                  gt: parsedStartTime,
                },
              },
            },
          }),
      },
      include: {
        building_gates: true,
        zones: {
          include: {
            vehicle_types: true,
            building_floors: {
              include: {
                buildings: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          zones: {
            zone_name: "asc",
          },
        },
        {
          slot_name: "asc",
        },
      ],
    });

    return res.json({
      success: true,
      message: "Get available parking slots successfully",
      data: parkingSlots.map(mapParkingSlot),
    });
  } catch (error) {
    console.error("Get available parking slots error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getParkingSlots = async (req, res) => {
  try {
    const {
      buildingId,
      floorId,
      zoneId,
      gateId,
      nearElevator,
      nearExit,
      nearEntryGate,
      nearExitGate,
      status,
    } = req.query;

    const parsedNearElevator = parseOptionalBoolean(nearElevator);
    const parsedNearExit = parseOptionalBoolean(nearExit);
    const parsedNearEntryGate = parseOptionalBoolean(nearEntryGate);
    const parsedNearExitGate = parseOptionalBoolean(nearExitGate);

    if (
      [buildingId, floorId, zoneId, gateId]
        .filter(Boolean)
        .some((value) => !isValidUUID(value))
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more filter ids are invalid",
      });
    }

    const parkingSlots = await prisma.parking_slots.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(zoneId ? { zone_id: zoneId } : {}),
        ...(gateId ? { nearest_gate_id: gateId } : {}),
        ...(parsedNearElevator !== undefined
          ? { near_elevator: parsedNearElevator }
          : {}),
        ...(parsedNearExit !== undefined ? { near_exit: parsedNearExit } : {}),
        ...(parsedNearEntryGate !== undefined
          ? { near_entry_gate: parsedNearEntryGate }
          : {}),
        ...(parsedNearExitGate !== undefined
          ? { near_exit_gate: parsedNearExitGate }
          : {}),
        ...((buildingId || floorId) && {
          zones: {
            is: {
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
          },
        }),
      },
      include: {
        building_gates: true,
        zones: {
          include: {
            vehicle_types: true,
            building_floors: {
              include: {
                buildings: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          zones: {
            zone_name: "asc",
          },
        },
        {
          slot_name: "asc",
        },
      ],
    });

    return res.json({
      success: true,
      message: "Get parking slots successfully",
      data: parkingSlots.map(mapParkingSlot),
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

export const createParkingSlot = async (req, res) => {
  try {
    const {
      slotNumber,
      slotName,
      zoneId,
      status = "AVAILABLE",
      distanceToGate = 0,
      nearestGateId,
      nearElevator = false,
      nearExit = false,
      nearEntryGate = false,
      nearExitGate = false,
    } = req.body;

    const finalSlotName = slotNumber || slotName;
    const parsedNearElevator = normalizeBooleanInput(nearElevator);
    const parsedNearExit = normalizeBooleanInput(nearExit);
    const parsedNearEntryGate = normalizeBooleanInput(nearEntryGate);
    const parsedNearExitGate = normalizeBooleanInput(nearExitGate);

    if (!finalSlotName || !zoneId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!isValidUUID(zoneId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zoneId",
      });
    }

    if (nearestGateId && !isValidUUID(nearestGateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid nearestGateId",
      });
    }

    if (status && !VALID_SLOT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot status",
      });
    }

    const zone = await findZoneById(zoneId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found",
      });
    }

    const gate = await findGateById(nearestGateId);

    if (nearestGateId && !gate) {
      return res.status(404).json({
        success: false,
        message: "Nearest gate not found",
      });
    }

    const zoneBuildingId = zone.building_floors?.building_id;
    if (gate && zoneBuildingId && gate.building_id !== zoneBuildingId) {
      return res.status(400).json({
        success: false,
        message: "Nearest gate must belong to the same building as the zone",
      });
    }

    const normalizedSlotName = finalSlotName.trim();

    const existingSlot = await prisma.parking_slots.findFirst({
      where: {
        zone_id: zoneId,
        slot_name: normalizedSlotName,
      },
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: "Parking slot already exists in this zone",
      });
    }

    const parkingSlot = await prisma.parking_slots.create({
      data: {
        slot_name: normalizedSlotName,
        zone_id: zoneId,
        status,
        distance_to_gate: Number(distanceToGate) || 0,
        nearest_gate_id: nearestGateId || null,
        near_elevator: parsedNearElevator ?? false,
        near_exit: parsedNearExit ?? false,
        near_entry_gate: parsedNearEntryGate ?? false,
        near_exit_gate: parsedNearExitGate ?? false,
      },
      include: {
        building_gates: true,
        zones: {
          include: {
            vehicle_types: true,
            building_floors: {
              include: {
                buildings: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create parking slot successfully",
      data: mapParkingSlot(parkingSlot),
    });
  } catch (error) {
    console.error("Create parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      slotNumber,
      slotName,
      zoneId,
      status,
      distanceToGate,
      nearestGateId,
      nearElevator,
      nearExit,
      nearEntryGate,
      nearExitGate,
    } = req.body;
    const parsedNearElevator = normalizeBooleanInput(nearElevator);
    const parsedNearExit = normalizeBooleanInput(nearExit);
    const parsedNearEntryGate = normalizeBooleanInput(nearEntryGate);
    const parsedNearExitGate = normalizeBooleanInput(nearExitGate);

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot id",
      });
    }

    if (zoneId && !isValidUUID(zoneId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zoneId",
      });
    }

    if (nearestGateId && !isValidUUID(nearestGateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid nearestGateId",
      });
    }

    if (status && !VALID_SLOT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot status",
      });
    }

    const parkingSlot = await prisma.parking_slots.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            building_floors: true,
          },
        },
      },
    });

    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found",
      });
    }

    const nextZoneId = zoneId || parkingSlot.zone_id;
    const zone = nextZoneId ? await findZoneById(nextZoneId) : null;

    if (nextZoneId && !zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found",
      });
    }

    const gate =
      nearestGateId === undefined
        ? await findGateById(parkingSlot.nearest_gate_id)
        : await findGateById(nearestGateId);

    if (nearestGateId && !gate) {
      return res.status(404).json({
        success: false,
        message: "Nearest gate not found",
      });
    }

    const zoneBuildingId = zone?.building_floors?.building_id;
    if (gate && zoneBuildingId && gate.building_id !== zoneBuildingId) {
      return res.status(400).json({
        success: false,
        message: "Nearest gate must belong to the same building as the zone",
      });
    }

    const finalSlotName = slotNumber || slotName;
    const nextSlotName = finalSlotName
      ? finalSlotName.trim()
      : parkingSlot.slot_name;

    const duplicateSlot = await prisma.parking_slots.findFirst({
      where: {
        zone_id: nextZoneId,
        slot_name: nextSlotName,
        NOT: {
          id,
        },
      },
    });

    if (duplicateSlot) {
      return res.status(400).json({
        success: false,
        message: "Parking slot already exists in this zone",
      });
    }

    const updatedParkingSlot = await prisma.parking_slots.update({
      where: { id },
      data: {
        ...(finalSlotName && { slot_name: finalSlotName.trim() }),
        ...(zoneId && { zone_id: zoneId }),
        ...(status && { status }),
        ...(distanceToGate !== undefined && {
          distance_to_gate: Number(distanceToGate) || 0,
        }),
        ...(nearestGateId !== undefined && {
          nearest_gate_id: nearestGateId || null,
        }),
        ...(nearElevator !== undefined && {
          near_elevator: parsedNearElevator ?? false,
        }),
        ...(nearExit !== undefined && {
          near_exit: parsedNearExit ?? false,
        }),
        ...(nearEntryGate !== undefined && {
          near_entry_gate: parsedNearEntryGate ?? false,
        }),
        ...(nearExitGate !== undefined && {
          near_exit_gate: parsedNearExitGate ?? false,
        }),
      },
      include: {
        building_gates: true,
        zones: {
          include: {
            vehicle_types: true,
            building_floors: {
              include: {
                buildings: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Update parking slot successfully",
      data: mapParkingSlot(updatedParkingSlot),
    });
  } catch (error) {
    console.error("Update parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking slot id",
      });
    }

    const parkingSlot = await prisma.parking_slots.findUnique({
      where: { id },
    });

    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found",
      });
    }

    const activeSessionCount = await prisma.parking_sessions.count({
      where: {
        OR: [{ parking_slot_id: id }, { assigned_slot_id: id }],
      },
    });

    if (activeSessionCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete parking slot because it is used by parking sessions",
      });
    }

    const reservationCount = await prisma.reservations.count({
      where: {
        parking_slot_id: id,
      },
    });

    if (reservationCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete parking slot because it is used by reservations",
      });
    }

    await prisma.parking_slots.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete parking slot successfully",
    });
  } catch (error) {
    console.error("Delete parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
