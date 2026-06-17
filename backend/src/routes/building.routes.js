import express from "express";
import {
  createBuilding,
  deleteBuilding,
  getBuildings,
  updateBuilding,
} from "../controllers/building.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getBuildings);

router.post("/", verifyToken, requireRoles("ADMIN", "MANAGER"), createBuilding);

router.put(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  updateBuilding,
);

router.delete(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  deleteBuilding,
);

export default router;
