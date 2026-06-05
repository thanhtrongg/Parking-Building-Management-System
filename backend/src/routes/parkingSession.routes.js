import express from "express";

import {
  checkInVehicle,
  checkOutVehicle,
  getParkingSessionById,
  getParkingSessions,
} from "../controllers/parkingSession.controller.js";

import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getParkingSessions);

router.post(
  "/check-in",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF"),
  checkInVehicle,
);

router.get("/:id", verifyToken, getParkingSessionById);

router.put(
  "/:id/checkout",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF"),
  checkOutVehicle,
);

export default router;
