import express from "express";

import { getReservations } from "../controllers/reservation.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getReservations);

export default router;
