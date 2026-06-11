import express from "express";

import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  checkInReservationByQr,
} from "../controllers/reservation.controller.js";

import { verifyToken, requireRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF", "USER"),
  getReservations,
);

router.get(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF", "USER"),
  getReservationById,
);

router.post(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "USER"),
  createReservation,
);

router.post(
  "/qr-check-in",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF"),
  checkInReservationByQr,
);

router.put(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF", "USER"),
  updateReservation,
);

router.delete(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "USER"),
  deleteReservation,
);

export default router;
