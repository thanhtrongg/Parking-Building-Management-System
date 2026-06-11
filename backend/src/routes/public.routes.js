import express from "express";

import { getPublicLandingInfo } from "../controllers/public.controller.js";

const router = express.Router();

router.get("/landing-info", getPublicLandingInfo);

export default router;
