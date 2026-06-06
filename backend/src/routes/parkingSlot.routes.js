import express from "express";

import {
  getParkingSlots,
  getAvailableParkingSlotsForReservation,
  createParkingSlot,
  updateParkingSlot,
  deleteParkingSlot,
} from "../controllers/parkingSlot.controller.js";

import { verifyToken, requireRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/available-for-reservation",
  verifyToken,
  requireRoles("USER", "ADMIN", "MANAGER", "STAFF"),
  getAvailableParkingSlotsForReservation,
);

router.get("/", verifyToken, getParkingSlots);

router.post(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  createParkingSlot,
);

router.put(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  updateParkingSlot,
);

router.delete(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  deleteParkingSlot,
);

export default router;
