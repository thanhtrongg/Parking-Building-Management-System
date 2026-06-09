import express from "express";

import {
  createFeedback,
  getMyFeedbacks,
} from "../controllers/feedback.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, requireRoles("USER"), getMyFeedbacks);

router.post("/", verifyToken, requireRoles("USER"), createFeedback);

export default router;
