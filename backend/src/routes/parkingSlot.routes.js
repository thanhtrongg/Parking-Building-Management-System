import express from "express";

import { getParkingSlots } from "../controllers/parkingSlot.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getParkingSlots);

export default router;
