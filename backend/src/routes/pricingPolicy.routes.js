import express from "express";

import {
  getPricingPolicies,
  getPricingPolicyById,
  createPricingPolicy,
  updatePricingPolicy,
  deletePricingPolicy,
} from "../controllers/pricingPolicy.controller.js";

import { verifyToken, requireRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF", "USER"),
  getPricingPolicies,
);

router.get(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF", "USER"),
  getPricingPolicyById,
);

router.post(
  "/",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  createPricingPolicy,
);

router.put(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  updatePricingPolicy,
);

router.delete(
  "/:id",
  verifyToken,
  requireRoles("ADMIN", "MANAGER"),
  deletePricingPolicy,
);

export default router;
