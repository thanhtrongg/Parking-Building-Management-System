import express from "express";
import {
  createBuildingFloor,
  deleteBuildingFloor,
  getBuildingFloors,
  updateBuildingFloor,
} from "../controllers/buildingFloor.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getBuildingFloors);

router.post(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  createBuildingFloor,
);

router.put(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  updateBuildingFloor,
);

router.delete(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  deleteBuildingFloor,
);

export default router;
