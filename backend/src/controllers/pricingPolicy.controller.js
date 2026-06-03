import prisma from "../config/prisma.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
};

const isValidDate = (date) => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};

const mapPricingPolicyResponse = (policy) => {
  return {
    id: policy.id,
    vehicleTypeId: policy.vehicle_type_id,
    vehicleType: policy.vehicle_types
      ? {
          id: policy.vehicle_types.id,
          typeName: policy.vehicle_types.type_name,
          description: policy.vehicle_types.description,
        }
      : null,
    basePrice: Number(policy.base_price),
    hourlyRate: policy.hourly_rate === null ? null : Number(policy.hourly_rate),
    nightRate: policy.night_rate === null ? null : Number(policy.night_rate),
    effectiveDate: policy.effective_date,
  };
};

const pricingPolicyInclude = {
  vehicle_types: {
    select: {
      id: true,
      type_name: true,
      description: true,
    },
  },
};

export const getPricingPolicies = async (req, res) => {
  try {
    const pricingPolicies = await prisma.pricing_policies.findMany({
      include: pricingPolicyInclude,
      orderBy: {
        effective_date: "desc",
      },
    });

    return res.json({
      success: true,
      message: "Get pricing policies successfully",
      data: pricingPolicies.map(mapPricingPolicyResponse),
    });
  } catch (error) {
    console.error("Get pricing policies error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getPricingPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pricing policy id",
      });
    }

    const pricingPolicy = await prisma.pricing_policies.findUnique({
      where: { id },
      include: pricingPolicyInclude,
    });

    if (!pricingPolicy) {
      return res.status(404).json({
        success: false,
        message: "Pricing policy not found",
      });
    }

    return res.json({
      success: true,
      message: "Get pricing policy detail successfully",
      data: mapPricingPolicyResponse(pricingPolicy),
    });
  } catch (error) {
    console.error("Get pricing policy detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createPricingPolicy = async (req, res) => {
  try {
    const {
      vehicleTypeId,
      basePrice,
      hourlyRate = 0,
      nightRate = 0,
      effectiveDate,
    } = req.body;

    if (basePrice === undefined || !effectiveDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (vehicleTypeId && !isValidUUID(vehicleTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicleTypeId",
      });
    }

    const parsedBasePrice = Number(basePrice);
    const parsedHourlyRate = Number(hourlyRate);
    const parsedNightRate = Number(nightRate);

    if (
      Number.isNaN(parsedBasePrice) ||
      Number.isNaN(parsedHourlyRate) ||
      Number.isNaN(parsedNightRate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price fields must be valid numbers",
      });
    }

    if (parsedBasePrice < 0 || parsedHourlyRate < 0 || parsedNightRate < 0) {
      return res.status(400).json({
        success: false,
        message: "Price fields cannot be negative",
      });
    }

    const parsedEffectiveDate = new Date(effectiveDate);

    if (!isValidDate(parsedEffectiveDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid effectiveDate",
      });
    }

    if (vehicleTypeId) {
      const vehicleType = await prisma.vehicle_types.findUnique({
        where: { id: vehicleTypeId },
      });

      if (!vehicleType) {
        return res.status(404).json({
          success: false,
          message: "Vehicle type not found",
        });
      }
    }

    const duplicatePolicy = await prisma.pricing_policies.findFirst({
      where: {
        vehicle_type_id: vehicleTypeId || null,
        effective_date: parsedEffectiveDate,
      },
    });

    if (duplicatePolicy) {
      return res.status(409).json({
        success: false,
        message:
          "Pricing policy already exists for this vehicle type and effective date",
      });
    }

    const pricingPolicy = await prisma.pricing_policies.create({
      data: {
        vehicle_type_id: vehicleTypeId || null,
        base_price: parsedBasePrice,
        hourly_rate: parsedHourlyRate,
        night_rate: parsedNightRate,
        effective_date: parsedEffectiveDate,
      },
      include: pricingPolicyInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Create pricing policy successfully",
      data: mapPricingPolicyResponse(pricingPolicy),
    });
  } catch (error) {
    console.error("Create pricing policy error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "Pricing policy already exists for this vehicle type and effective date",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updatePricingPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleTypeId, basePrice, hourlyRate, nightRate, effectiveDate } =
      req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pricing policy id",
      });
    }

    if (vehicleTypeId && !isValidUUID(vehicleTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicleTypeId",
      });
    }

    const pricingPolicy = await prisma.pricing_policies.findUnique({
      where: { id },
    });

    if (!pricingPolicy) {
      return res.status(404).json({
        success: false,
        message: "Pricing policy not found",
      });
    }

    if (vehicleTypeId) {
      const vehicleType = await prisma.vehicle_types.findUnique({
        where: { id: vehicleTypeId },
      });

      if (!vehicleType) {
        return res.status(404).json({
          success: false,
          message: "Vehicle type not found",
        });
      }
    }

    const data = {};

    if (vehicleTypeId !== undefined) {
      data.vehicle_type_id = vehicleTypeId || null;
    }

    if (basePrice !== undefined) {
      const parsedBasePrice = Number(basePrice);

      if (Number.isNaN(parsedBasePrice) || parsedBasePrice < 0) {
        return res.status(400).json({
          success: false,
          message: "basePrice must be a valid non-negative number",
        });
      }

      data.base_price = parsedBasePrice;
    }

    if (hourlyRate !== undefined) {
      const parsedHourlyRate = Number(hourlyRate);

      if (Number.isNaN(parsedHourlyRate) || parsedHourlyRate < 0) {
        return res.status(400).json({
          success: false,
          message: "hourlyRate must be a valid non-negative number",
        });
      }

      data.hourly_rate = parsedHourlyRate;
    }

    if (nightRate !== undefined) {
      const parsedNightRate = Number(nightRate);

      if (Number.isNaN(parsedNightRate) || parsedNightRate < 0) {
        return res.status(400).json({
          success: false,
          message: "nightRate must be a valid non-negative number",
        });
      }

      data.night_rate = parsedNightRate;
    }

    if (effectiveDate !== undefined) {
      const parsedEffectiveDate = new Date(effectiveDate);

      if (!isValidDate(parsedEffectiveDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid effectiveDate",
        });
      }

      data.effective_date = parsedEffectiveDate;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const nextVehicleTypeId =
      data.vehicle_type_id !== undefined
        ? data.vehicle_type_id
        : pricingPolicy.vehicle_type_id;

    const nextEffectiveDate =
      data.effective_date !== undefined
        ? data.effective_date
        : pricingPolicy.effective_date;

    const duplicatePolicy = await prisma.pricing_policies.findFirst({
      where: {
        vehicle_type_id: nextVehicleTypeId,
        effective_date: nextEffectiveDate,
        NOT: {
          id,
        },
      },
    });

    if (duplicatePolicy) {
      return res.status(409).json({
        success: false,
        message:
          "Pricing policy already exists for this vehicle type and effective date",
      });
    }

    const updatedPricingPolicy = await prisma.pricing_policies.update({
      where: { id },
      data,
      include: pricingPolicyInclude,
    });

    return res.json({
      success: true,
      message: "Update pricing policy successfully",
      data: mapPricingPolicyResponse(updatedPricingPolicy),
    });
  } catch (error) {
    console.error("Update pricing policy error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "Pricing policy already exists for this vehicle type and effective date",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deletePricingPolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pricing policy id",
      });
    }

    const pricingPolicy = await prisma.pricing_policies.findUnique({
      where: { id },
    });

    if (!pricingPolicy) {
      return res.status(404).json({
        success: false,
        message: "Pricing policy not found",
      });
    }

    await prisma.pricing_policies.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete pricing policy successfully",
    });
  } catch (error) {
    console.error("Delete pricing policy error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
