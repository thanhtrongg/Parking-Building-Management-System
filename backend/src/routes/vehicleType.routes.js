import express from "express";

import { getVehicleTypes } from "../controllers/vehicleType.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getVehicleTypes);

export default router;
