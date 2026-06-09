import express from "express";

import { getMyParkingSessions } from "../controllers/parkingSession.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, requireRoles("USER"), getMyParkingSessions);

export default router;
