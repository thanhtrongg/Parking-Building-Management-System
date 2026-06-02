import prisma from "../config/prisma.js";

export const getZones = async (req, res) => {
    try {
        const zones = await prisma.$queryRaw`
      SELECT
        z.id,
        z.zone_name AS "zoneName",
        z.total_capacity AS "totalCapacity",

        vt.id AS "vehicleTypeId",
        vt.type_name AS "vehicleTypeName",
        vt.description AS "vehicleTypeDescription"

      FROM zones z
      JOIN vehicle_types vt
        ON z.vehicle_type_id = vt.id

      ORDER BY z.zone_name ASC
    `;

        return res.json({
            success: true,
            message: "Get zones successfully",
            data: zones,
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
        const { zoneName, vehicleTypeId, totalCapacity } = req.body;

        if (!zoneName || !vehicleTypeId || !totalCapacity) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const vehicleType = await prisma.vehicle_types.findUnique({
            where: {
                id: vehicleTypeId,
            },
        });

        if (!vehicleType) {
            return res.status(400).json({
                success: false,
                message: "Vehicle type not found",
            });
        }

        const zone = await prisma.zones.create({
            data: {
                zone_name: zoneName.trim(),
                vehicle_type_id: vehicleTypeId,
                total_capacity: Number(totalCapacity),
            },
        });

        return res.status(201).json({
            success: true,
            message: "Create zone successfully",
            data: zone,
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
        const { zoneName, vehicleTypeId, totalCapacity } = req.body;

        const zone = await prisma.zones.findUnique({
            where: { id },
        });

        if (!zone) {
            return res.status(404).json({
                success: false,
                message: "Zone not found",
            });
        }

        const vehicleType = await prisma.vehicle_types.findUnique({
            where: {
                id: vehicleTypeId,
            },
        });

        if (!vehicleType) {
            return res.status(400).json({
                success: false,
                message: "Vehicle type not found",
            });
        }

        const updatedZone = await prisma.zones.update({
            where: { id },
            data: {
                zone_name: zoneName.trim(),
                vehicle_type_id: vehicleTypeId,
                total_capacity: Number(totalCapacity),
            },
        });

        return res.json({
            success: true,
            message: "Update zone successfully",
            data: updatedZone,
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