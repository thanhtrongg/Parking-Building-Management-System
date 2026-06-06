import express from "express";

import * as authController from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", verifyToken, authController.getMe);
router.post("/logout", verifyToken, authController.logout);

export default router;
