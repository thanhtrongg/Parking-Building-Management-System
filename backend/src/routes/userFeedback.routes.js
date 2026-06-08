import express from "express";

import { createUserFeedback } from "../controllers/userFeedback.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRoles("USER"), createUserFeedback);

export default router;
