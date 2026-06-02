import express from "express";

import {
  getVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from "../controllers/vehicleType.controller.js";

import { verifyToken, requireRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getVehicleTypes);

router.post(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  createVehicleType,
);

router.put(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  updateVehicleType,
);

router.delete(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  deleteVehicleType,
);

export default router;
