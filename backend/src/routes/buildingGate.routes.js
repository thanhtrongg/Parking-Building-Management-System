import express from "express";
import {
  createBuildingGate,
  deleteBuildingGate,
  getBuildingGates,
  updateBuildingGate,
} from "../controllers/buildingGate.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getBuildingGates);

router.post(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  createBuildingGate,
);

router.put(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  updateBuildingGate,
);

router.delete(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  deleteBuildingGate,
);

export default router;
