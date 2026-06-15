import express from "express";

import { chatWithAssistant } from "../controllers/assistant.controller.js";
import { optionalToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/chat", optionalToken, chatWithAssistant);

export default router;
