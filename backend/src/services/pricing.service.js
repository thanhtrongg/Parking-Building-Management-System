import prisma from "../config/prisma.js";

const BASE_PRICE_HOURS = 2;
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;

  const number = Number(value);

  return Number.isNaN(number) ? fallback : number;
};

const calculateParkingHours = (startTime, endTime) => {
  const diffMs = new Date(endTime) - new Date(startTime);

  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
};

const isNightHour = (date) => {
  const hour = date.getHours();

  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
};

export const getPricingPolicyForSession = async (vehicleTypeId, startTime) => {
  const effectiveDate = new Date(startTime);

  const vehicleTypePolicy = vehicleTypeId
    ? await prisma.pricing_policies.findFirst({
        where: {
          vehicle_type_id: vehicleTypeId,
          effective_date: {
            lte: effectiveDate,
          },
        },
        orderBy: {
          effective_date: "desc",
        },
      })
    : null;

  if (vehicleTypePolicy) return vehicleTypePolicy;

  return prisma.pricing_policies.findFirst({
    where: {
      vehicle_type_id: null,
      effective_date: {
        lte: effectiveDate,
      },
    },
    orderBy: {
      effective_date: "desc",
    },
  });
};

export const calculateParkingFee = (startTime, endTime, pricingPolicy) => {
  const parkingHours = calculateParkingHours(startTime, endTime);

  if (!pricingPolicy) {
    return {
      totalAmount: 0,
      parkingHours,
      basePrice: 0,
      hourlyRate: 0,
      nightRate: 0,
      billableHourlyHours: 0,
      billableNightHours: 0,
    };
  }

  const basePrice = toNumber(pricingPolicy.base_price);
  const hourlyRate = toNumber(pricingPolicy.hourly_rate);
  const nightRate = toNumber(pricingPolicy.night_rate, hourlyRate);

  let billableHourlyHours = 0;
  let billableNightHours = 0;
  const startDate = new Date(startTime);

  for (let hourIndex = BASE_PRICE_HOURS; hourIndex < parkingHours; hourIndex += 1) {
    const hourStart = new Date(startDate);
    hourStart.setHours(startDate.getHours() + hourIndex);

    if (isNightHour(hourStart)) {
      billableNightHours += 1;
    } else {
      billableHourlyHours += 1;
    }
  }

  const totalAmount =
    basePrice +
    billableHourlyHours * hourlyRate +
    billableNightHours * nightRate;

  return {
    totalAmount,
    parkingHours,
    basePrice,
    hourlyRate,
    nightRate,
    billableHourlyHours,
    billableNightHours,
  };
};

export const getFeeForVehicleType = async (vehicleTypeId, startTime, endTime) => {
  const pricingPolicy = await getPricingPolicyForSession(vehicleTypeId, startTime);

  return calculateParkingFee(startTime, endTime, pricingPolicy);
};
