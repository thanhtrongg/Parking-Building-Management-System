import express from "express";

import {
  createFeedback,
  getFeedbackById,
  getFeedbacks,
  updateFeedbackStatus,
} from "../controllers/feedback.controller.js";

import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF"),
  getFeedbacks,
);

router.get(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF"),
  getFeedbackById,
);

router.post("/", verifyToken, requireRoles("USER"), createFeedback);

router.patch(
  "/:id/status",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF"),
  updateFeedbackStatus,
);

export default router;
