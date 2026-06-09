import express from "express";

import { createFeedback } from "../controllers/feedback.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRoles("USER"), createFeedback);

export default router;
