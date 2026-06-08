import express from "express";

import { cancelMyReservation } from "../controllers/reservation.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.patch("/:id/cancel", verifyToken, requireRoles("USER"), cancelMyReservation);

export default router;
