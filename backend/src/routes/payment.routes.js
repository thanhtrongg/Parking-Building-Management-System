import express from "express";

import {
  createSepayReservationPayment,
  getPayments,
  getSepayPaymentStatus,
  handleSepayWebhook,
  simulateSepaySandboxPayment,
} from "../controllers/payment.controller.js";
import { requireRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getPayments);
router.post(
  "/sepay/reservations/:reservationId",
  verifyToken,
  createSepayReservationPayment,
);
router.get("/sepay/:paymentCode/status", verifyToken, getSepayPaymentStatus);
router.post(
  "/sepay/sandbox/simulate",
  verifyToken,
  requireRoles("ADMIN", "MANAGER", "STAFF"),
  simulateSepaySandboxPayment,
);
router.post("/sepay/webhook", handleSepayWebhook);

export default router;
