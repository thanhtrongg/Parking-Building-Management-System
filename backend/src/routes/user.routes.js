import express from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from "../controllers/user.controller.js";

import { verifyToken, requireRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.patch(
  "/profile/password",
  verifyToken,
  changePassword
);

router.use(
  verifyToken,
  requireRoles("ADMIN")
);
router.use(verifyToken, requireRoles("ADMIN"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
