import prisma from "../config/prisma.js";

const mapPricingPolicy = (policy) => ({
  id: policy.id,
  vehicleTypeId: policy.vehicle_type_id,
  vehicleTypeName: policy.vehicle_types?.type_name || "All vehicles",
  vehicleTypeDescription: policy.vehicle_types?.description || "",
  basePrice: Number(policy.base_price),
  hourlyRate: policy.hourly_rate === null ? null : Number(policy.hourly_rate),
  nightRate: policy.night_rate === null ? null : Number(policy.night_rate),
  effectiveDate: policy.effective_date,
});

const mapSlot = (slot) => ({
  id: slot.id,
  slotName: slot.slot_name,
  status: slot.status,
  distanceToGate: slot.distance_to_gate,
  zoneId: slot.zone_id,
  zoneName: slot.zones?.zone_name || null,
  vehicleTypeId: slot.zones?.vehicle_type_id || null,
  vehicleTypeName: slot.zones?.vehicle_types?.type_name || null,
});

const mapZone = (zone) => ({
  id: zone.id,
  zoneName: zone.zone_name,
  totalCapacity: zone.total_capacity,
  vehicleTypeId: zone.vehicle_type_id,
  vehicleTypeName: zone.vehicle_types?.type_name || null,
  slotCount: zone.parking_slots.length,
  availableSlots: zone.parking_slots.filter(
    (slot) => slot.status === "AVAILABLE",
  ).length,
});

export const getPublicLandingInfo = async (req, res) => {
  try {
    const [parkingSlots, pricingPolicies, zones, vehicleTypes] =
      await Promise.all([
        prisma.parking_slots.findMany({
          include: {
            zones: {
              include: {
                vehicle_types: true,
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
        }),
        prisma.pricing_policies.findMany({
          include: {
            vehicle_types: true,
          },
          orderBy: {
            effective_date: "desc",
          },
        }),
        prisma.zones.findMany({
          include: {
            vehicle_types: true,
            parking_slots: true,
          },
          orderBy: {
            zone_name: "asc",
          },
        }),
        prisma.vehicle_types.findMany({
          orderBy: {
            type_name: "asc",
          },
        }),
      ]);

    const totalSlots = parkingSlots.length;
    const availableSlots = parkingSlots.filter(
      (slot) => slot.status === "AVAILABLE",
    );

    return res.json({
      success: true,
      message: "Get public landing information successfully",
      data: {
        summary: {
          totalSlots,
          availableSlots: availableSlots.length,
          occupiedSlots: parkingSlots.filter((slot) => slot.status === "OCCUPIED")
            .length,
          reservedSlots: parkingSlots.filter((slot) => slot.status === "RESERVED")
            .length,
          maintenanceSlots: parkingSlots.filter(
            (slot) => slot.status === "MAINTENANCE",
          ).length,
          totalZones: zones.length,
          vehicleTypes: vehicleTypes.length,
        },
        zones: zones.map(mapZone),
        availableSlots: availableSlots.map(mapSlot),
        pricingPolicies: pricingPolicies.map(mapPricingPolicy),
      },
    });
  } catch (error) {
    console.error("Get public landing info error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
