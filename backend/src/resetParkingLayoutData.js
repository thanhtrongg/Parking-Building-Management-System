import bcrypt from "bcryptjs";
import prisma from "./config/prisma.js";

const VEHICLE_TYPES = [
  {
    type_name: "Another Vehicle",
    description:
      "Mixed-purpose parking for bicycles, cargo tricycles, and similar vehicles",
    pricing: { base_price: 4000, hourly_rate: 2000, night_rate: 3000 },
  },
  {
    type_name: "Motorcycle",
    description: "Standard motorcycle parking",
    pricing: { base_price: 5000, hourly_rate: 3000, night_rate: 4000 },
  },
  {
    type_name: "Electric Motorcycle",
    description: "Electric motorcycle and electric scooter parking",
    pricing: { base_price: 6500, hourly_rate: 3500, night_rate: 4500 },
  },
  {
    type_name: "Heavy Motorcycle",
    description: "Large-displacement motorcycle parking",
    pricing: { base_price: 8000, hourly_rate: 4000, night_rate: 5500 },
  },
  {
    type_name: "Car",
    description:
      "Parking for cars and light four-wheel vehicles except heavy trucks",
    pricing: { base_price: 18000, hourly_rate: 9000, night_rate: 13000 },
  },
  {
    type_name: "Electric Car",
    description: "Dedicated parking for electric cars with charging support",
    pricing: { base_price: 22000, hourly_rate: 11000, night_rate: 15000 },
  },
];

const BUILDING_TEMPLATE = {
  address: "Spiral parking building campus",
  description:
    "Spiral parking building above ground with 2 entry gates, 2 exit gates, 2 elevators, and 2 emergency staircases",
  floors: [
    {
      floorCode: "G",
      floorName: "Ground Floor Mixed Vehicles",
      levelNumber: 0,
      zones: [
        {
          zoneName: "Ground Mixed Zone A",
          zoneCode: "ZA",
          slotPrefix: "",
          vehicleType: "Another Vehicle",
          totalCapacity: 12,
        },
        {
          zoneName: "Ground Mixed Zone B",
          zoneCode: "ZB",
          slotPrefix: "",
          vehicleType: "Another Vehicle",
          totalCapacity: 12,
        },
        {
          zoneName: "Ground Mixed Zone C",
          zoneCode: "ZC",
          slotPrefix: "",
          vehicleType: "Another Vehicle",
          totalCapacity: 12,
        },
      ],
    },
    {
      floorCode: "1",
      floorName: "Level 1 Motorcycles",
      levelNumber: 1,
      zones: [
        {
          zoneName: "Level 1 Motorcycle Zone A",
          zoneCode: "ZA",
          slotPrefix: "",
          vehicleType: "Motorcycle",
          totalCapacity: 16,
        },
        {
          zoneName: "Level 1 Electric Motorcycle Zone B",
          zoneCode: "ZB",
          slotPrefix: "E",
          vehicleType: "Electric Motorcycle",
          totalCapacity: 14,
        },
        {
          zoneName: "Level 1 Heavy Motorcycle Zone C",
          zoneCode: "ZC",
          slotPrefix: "",
          vehicleType: "Heavy Motorcycle",
          totalCapacity: 10,
        },
      ],
    },
    {
      floorCode: "2",
      floorName: "Level 2 Motorcycles",
      levelNumber: 2,
      zones: [
        {
          zoneName: "Level 2 Motorcycle Zone A",
          zoneCode: "ZA",
          slotPrefix: "",
          vehicleType: "Motorcycle",
          totalCapacity: 16,
        },
        {
          zoneName: "Level 2 Electric Motorcycle Zone B",
          zoneCode: "ZB",
          slotPrefix: "E",
          vehicleType: "Electric Motorcycle",
          totalCapacity: 14,
        },
        {
          zoneName: "Level 2 Heavy Motorcycle Zone C",
          zoneCode: "ZC",
          slotPrefix: "",
          vehicleType: "Heavy Motorcycle",
          totalCapacity: 10,
        },
      ],
    },
    {
      floorCode: "3",
      floorName: "Level 3 Cars",
      levelNumber: 3,
      zones: [
        {
          zoneName: "Level 3 Car Zone A",
          zoneCode: "ZA",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 3 Car Zone B",
          zoneCode: "ZB",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 3 Car Zone C",
          zoneCode: "ZC",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 3 Electric Car Zone",
          zoneCode: "ZE",
          slotPrefix: "E",
          vehicleType: "Electric Car",
          totalCapacity: 8,
        },
      ],
    },
    {
      floorCode: "4",
      floorName: "Level 4 Cars",
      levelNumber: 4,
      zones: [
        {
          zoneName: "Level 4 Car Zone A",
          zoneCode: "ZA",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 4 Car Zone B",
          zoneCode: "ZB",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 4 Car Zone C",
          zoneCode: "ZC",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 4 Electric Car Zone",
          zoneCode: "ZE",
          slotPrefix: "E",
          vehicleType: "Electric Car",
          totalCapacity: 8,
        },
      ],
    },
    {
      floorCode: "5",
      floorName: "Level 5 Cars",
      levelNumber: 5,
      zones: [
        {
          zoneName: "Level 5 Car Zone A",
          zoneCode: "ZA",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 5 Car Zone B",
          zoneCode: "ZB",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 5 Car Zone C",
          zoneCode: "ZC",
          slotPrefix: "",
          vehicleType: "Car",
          totalCapacity: 12,
        },
        {
          zoneName: "Level 5 Electric Car Zone",
          zoneCode: "ZE",
          slotPrefix: "E",
          vehicleType: "Electric Car",
          totalCapacity: 8,
        },
      ],
    },
  ],
  gates: [
    {
      gateCode: "ENTRY-01",
      gateName: "Entry Gate 1",
      gateType: "ENTRY",
      locationDescription: "Ground level left-side entry gate",
    },
    {
      gateCode: "ENTRY-02",
      gateName: "Entry Gate 2",
      gateType: "ENTRY",
      locationDescription: "Ground level right-side entry gate",
    },
    {
      gateCode: "EXIT-01",
      gateName: "Exit Gate 1",
      gateType: "EXIT",
      locationDescription: "Ground level left-side exit gate",
    },
    {
      gateCode: "EXIT-02",
      gateName: "Exit Gate 2",
      gateType: "EXIT",
      locationDescription: "Ground level right-side exit gate",
    },
  ],
};

const BUILDING_BLUEPRINTS = [
  {
    buildingCode: "BUILDING-A",
    buildingName: "Building A",
    ...BUILDING_TEMPLATE,
  },
  {
    buildingCode: "BUILDING-B",
    buildingName: "Building B",
    ...BUILDING_TEMPLATE,
  },
];

function getBuildingTag(buildingCode) {
  return String(buildingCode || "")
    .trim()
    .split("-")
    .pop()
    .slice(0, 1)
    .toUpperCase();
}

function buildSlotName(buildingCode, floorCode, zoneCode, slotPrefix, index) {
  const paddedIndex = String(index).padStart(2, "0");
  return `${getBuildingTag(buildingCode)}-${floorCode}-${zoneCode}-${slotPrefix}${paddedIndex}`;
}

function buildZoneName(buildingName, zoneName) {
  return `${buildingName} - ${zoneName}`;
}

async function ensureAdminUser() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  return prisma.users.upsert({
    where: {
      email: "admin@gmail.com",
    },
    update: {
      password: hashedPassword,
      full_name: "System Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      username: "admin",
      password: hashedPassword,
      full_name: "System Admin",
      email: "admin@gmail.com",
      phone: "0900000000",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
}

async function clearOperationalData() {
  await prisma.$transaction([
    prisma.feedbacks.deleteMany(),
    prisma.payments.deleteMany(),
    prisma.parking_sessions.deleteMany(),
    prisma.reservations.deleteMany(),
    prisma.parking_slots.deleteMany(),
    prisma.zones.deleteMany(),
    prisma.pricing_policies.deleteMany(),
    prisma.vehicle_types.deleteMany(),
    prisma.building_gates.deleteMany(),
    prisma.building_floors.deleteMany(),
    prisma.buildings.deleteMany(),
  ]);
}

async function seedVehicleTypes() {
  const vehicleTypeMap = {};

  for (const vehicleType of VEHICLE_TYPES) {
    const createdVehicleType = await prisma.vehicle_types.create({
      data: {
        type_name: vehicleType.type_name,
        description: vehicleType.description,
      },
    });

    vehicleTypeMap[vehicleType.type_name] = createdVehicleType;

    await prisma.pricing_policies.create({
      data: {
        vehicle_type_id: createdVehicleType.id,
        base_price: vehicleType.pricing.base_price,
        hourly_rate: vehicleType.pricing.hourly_rate,
        night_rate: vehicleType.pricing.night_rate,
        effective_date: new Date("2026-06-17"),
      },
    });
  }

  return vehicleTypeMap;
}

function getFloorDescription(levelNumber) {
  if (levelNumber === 0) {
    return "Mixed-use floor for bicycles, cargo tricycles, and other similar vehicles";
  }

  if (levelNumber <= 2) {
    return "Motorcycle-focused floor for motorcycles, electric motorcycles, and heavy motorcycles";
  }

  return "Car-focused floor for standard cars and electric cars";
}

function getSlotLandmarkConfig(index, totalCapacity, entryGates, exitGates) {
  const cycle = (index - 1) % 4;

  if (cycle === 0) {
    return {
      nearestGate: entryGates[0],
      nearEntryGate: true,
      nearExitGate: false,
    };
  }

  if (cycle === 1) {
    return {
      nearestGate: exitGates[0],
      nearEntryGate: false,
      nearExitGate: true,
    };
  }

  if (cycle === 2) {
    return {
      nearestGate: entryGates[1],
      nearEntryGate: true,
      nearExitGate: false,
    };
  }

  return {
    nearestGate: exitGates[1],
    nearEntryGate: false,
    nearExitGate: true,
  };
}

async function seedBuildings(vehicleTypeMap) {
  for (const blueprint of BUILDING_BLUEPRINTS) {
    const building = await prisma.buildings.create({
      data: {
        building_code: blueprint.buildingCode,
        building_name: blueprint.buildingName,
        address: blueprint.address,
        description: blueprint.description,
        status: "ACTIVE",
      },
    });

    const createdGates = [];

    for (const gate of blueprint.gates) {
      const createdGate = await prisma.building_gates.create({
        data: {
          building_id: building.id,
          gate_code: gate.gateCode,
          gate_name: gate.gateName,
          gate_type: gate.gateType,
          location_description: gate.locationDescription,
          status: "ACTIVE",
        },
      });

      createdGates.push(createdGate);
    }

    const entryGates = createdGates.filter((gate) => gate.gate_type === "ENTRY");
    const exitGates = createdGates.filter((gate) => gate.gate_type === "EXIT");

    for (const floorBlueprint of blueprint.floors) {
      const floor = await prisma.building_floors.create({
        data: {
          building_id: building.id,
          floor_code: floorBlueprint.floorCode,
          floor_name: floorBlueprint.floorName,
          level_number: floorBlueprint.levelNumber,
          description: getFloorDescription(floorBlueprint.levelNumber),
          status: "ACTIVE",
        },
      });

      for (const zoneBlueprint of floorBlueprint.zones) {
        const zone = await prisma.zones.create({
          data: {
            floor_id: floor.id,
            zone_name: buildZoneName(blueprint.buildingName, zoneBlueprint.zoneName),
            vehicle_type_id: vehicleTypeMap[zoneBlueprint.vehicleType].id,
            total_capacity: zoneBlueprint.totalCapacity,
          },
        });

        for (let index = 1; index <= zoneBlueprint.totalCapacity; index += 1) {
          const landmark = getSlotLandmarkConfig(
            index,
            zoneBlueprint.totalCapacity,
            entryGates,
            exitGates,
          );

          await prisma.parking_slots.create({
            data: {
              zone_id: zone.id,
              slot_name: buildSlotName(
                blueprint.buildingCode,
                floorBlueprint.floorCode,
                zoneBlueprint.zoneCode,
                zoneBlueprint.slotPrefix,
                index,
              ),
              status: "AVAILABLE",
              distance_to_gate: floorBlueprint.levelNumber <= 2 ? index * 3 : index * 5,
              nearest_gate_id: landmark.nearestGate?.id || null,
              near_elevator: index <= 4,
              near_exit: index % 6 === 0 || index >= zoneBlueprint.totalCapacity - 1,
              near_entry_gate: landmark.nearEntryGate,
              near_exit_gate: landmark.nearExitGate,
            },
          });
        }
      }
    }
  }
}

async function main() {
  console.log("Ensuring admin account exists...");
  await ensureAdminUser();

  console.log("Clearing old operational and layout data...");
  await clearOperationalData();

  console.log("Seeding vehicle types and pricing policies...");
  const vehicleTypeMap = await seedVehicleTypes();

  console.log("Seeding buildings, floors, gates, zones, and slots...");
  await seedBuildings(vehicleTypeMap);

  console.log("Reset and seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Reset parking layout data error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
