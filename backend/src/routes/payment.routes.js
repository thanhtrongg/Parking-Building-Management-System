import express from "express";

import {
  createSepayReservationPayment,
  getPayments,
  getSepayPaymentStatus,
  handleSepayWebhook,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getPayments);
router.post(
  "/sepay/reservations/:reservationId",
  verifyToken,
  createSepayReservationPayment,
);
router.get("/sepay/:paymentCode/status", verifyToken, getSepayPaymentStatus);
router.post("/sepay/webhook", handleSepayWebhook);

export default router;
