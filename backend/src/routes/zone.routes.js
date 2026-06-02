import express from "express";

import {
    getZones,
    createZone,
    updateZone,
    deleteZone,
} from "../controllers/zone.controller.js";

import {
    verifyToken,
    requireRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getZones);

router.post(
    "/",
    verifyToken,
    requireRoles("ADMIN", "MANAGER"),
    createZone
);

router.put(
    "/:id",
    verifyToken,
    requireRoles("ADMIN", "MANAGER"),
    updateZone
);

router.delete(
    "/:id",
    verifyToken,
    requireRoles("ADMIN", "MANAGER"),
    deleteZone
);

export default router;