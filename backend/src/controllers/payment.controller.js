import prisma from "../config/prisma.js";
import { getFeeForVehicleType } from "../services/pricing.service.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

const ACTIVE_RESERVATION_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN"];

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
};

const toPositiveAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount);
};

const buildSepayPaymentCode = (reservationId) => {
  const suffix = String(reservationId)
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase();
  return `PBMS${suffix}`;
};

const parseSepayTransactionDate = (value) => {
  if (!value) return new Date();

  const normalizedDate = String(value).replace(" ", "T");
  const parsedDate = new Date(`${normalizedDate}+07:00`);

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const buildSepayQrUrl = ({ amount, description }) => {
  const bankCode = getRequiredEnv("SEPAY_BANK_CODE");
  const accountNumber = getRequiredEnv("SEPAY_ACCOUNT_NUMBER");
  const accountName = process.env.SEPAY_ACCOUNT_NAME || "";
  const params = new URLSearchParams({
    bank: bankCode,
    acc: accountNumber,
    amount: String(amount),
    des: description,
  });

  if (accountName) {
    params.set("accountName", accountName);
  }

  return `https://qr.sepay.vn/img?${params.toString()}`;
};

const mapPayment = (payment) => {
  return {
    id: payment.id,
    reservationId: payment.reservation_id,
    parkingSessionId: payment.parking_session_id,
    amount: Number(payment.amount),
    paymentMethod: payment.payment_method,
    paymentTime: payment.payment_time,
    status: payment.status,
    sepayPaymentCode: payment.sepay_payment_code,
    sepayTransactionId: payment.sepay_transaction_id,
    sepayReferenceCode: payment.sepay_reference_code,
  };
};

export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.$queryRaw`
      SELECT
        p.id,
        p.amount,
        p.payment_method AS "paymentMethod",
        p.payment_time AS "paymentTime",
        p.status,
        p.reservation_id AS "reservationId",
        p.sepay_payment_code AS "sepayPaymentCode",
        p.sepay_transaction_id AS "sepayTransactionId",
        p.sepay_reference_code AS "sepayReferenceCode",

        ps.id AS "parkingSessionId",
        ps.ticket_code AS "ticketCode",
        ps.license_plate AS "licensePlate",
        ps.entry_time AS "entryTime",
        ps.exit_time AS "exitTime",
        ps.status AS "sessionStatus",

        u.id AS "userId",
        u.full_name AS "fullName",
        u.email,
        u.phone,

        vt.id AS "vehicleTypeId",
        vt.type_name AS "vehicleTypeName",

        slot.id AS "parkingSlotId",
        slot.slot_name AS "slotName",

        z.id AS "zoneId",
        z.zone_name AS "zoneName"
      FROM payments p
      LEFT JOIN parking_sessions ps ON p.parking_session_id = ps.id
      LEFT JOIN users u ON ps.user_id = u.id
      LEFT JOIN vehicle_types vt ON ps.vehicle_type_id = vt.id
      LEFT JOIN parking_slots slot ON ps.parking_slot_id = slot.id
      LEFT JOIN zones z ON slot.zone_id = z.id
      ORDER BY p.payment_time DESC
    `;

    return res.json({
      success: true,
      message: "Get payments successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createSepayReservationPayment = async (req, res) => {
  try {
    const { reservationId } = req.params;
    let amount = toPositiveAmount(req.body.amount);

    if (!isValidUUID(reservationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation id",
      });
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (req.user.role === "USER" && reservation.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: "Only active reservations can be paid",
      });
    }

    if (!amount) {
      const fee = await getFeeForVehicleType(
        reservation.vehicle_type_id,
        reservation.expected_start_time,
        reservation.expected_end_time,
      );
      amount = toPositiveAmount(fee.totalAmount);
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const paymentCode = buildSepayPaymentCode(reservationId);
    const description = `${paymentCode} thanh toan dat cho`;

    const existingPaidPayment = await prisma.payments.findFirst({
      where: {
        reservation_id: reservationId,
        payment_method: "SEPAY",
        status: "SUCCESS",
      },
    });

    if (existingPaidPayment) {
      return res.status(409).json({
        success: false,
        message: "Reservation has already been paid",
      });
    }

    const payment = await prisma.payments.upsert({
      where: {
        sepay_payment_code: paymentCode,
      },
      update: {
        amount,
        status: "PENDING",
      },
      create: {
        reservation_id: reservationId,
        amount,
        payment_method: "SEPAY",
        status: "PENDING",
        sepay_payment_code: paymentCode,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Create SePay payment successfully",
      data: {
        payment: mapPayment(payment),
        qrUrl: buildSepayQrUrl({ amount, description }),
        transferContent: paymentCode,
        bank: {
          code: process.env.SEPAY_BANK_CODE,
          accountNumber: process.env.SEPAY_ACCOUNT_NUMBER,
          accountName: process.env.SEPAY_ACCOUNT_NAME || "",
        },
      },
    });
  } catch (error) {
    console.error("Create SePay payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getSepayPaymentStatus = async (req, res) => {
  try {
    const { paymentCode } = req.params;

    const payment = await prisma.payments.findUnique({
      where: {
        sepay_payment_code: paymentCode,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (req.user.role === "USER" && payment.reservation_id) {
      const reservation = await prisma.reservations.findUnique({
        where: { id: payment.reservation_id },
      });

      if (!reservation || reservation.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    return res.json({
      success: true,
      message: "Get SePay payment status successfully",
      data: mapPayment(payment),
    });
  } catch (error) {
    console.error("Get SePay payment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const handleSepayWebhook = async (req, res) => {
  try {
    const expectedApiKey = process.env.SEPAY_WEBHOOK_API_KEY;

    if (expectedApiKey) {
      const authHeader = req.get("authorization") || "";
      const receivedApiKey = authHeader.startsWith("Apikey ")
        ? authHeader.slice("Apikey ".length)
        : "";

      if (receivedApiKey !== expectedApiKey) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    const payload = req.body || {};
    const sepayTransactionId = payload.id ? String(payload.id) : "";
    const paymentCode = payload.code || "";
    const transferAmount = toPositiveAmount(payload.transferAmount);

    if (!sepayTransactionId || !paymentCode || !transferAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    if (payload.transferType !== "in") {
      return res.json({ success: true });
    }

    const processedPayment = await prisma.payments.findFirst({
      where: {
        sepay_transaction_id: sepayTransactionId,
      },
    });

    if (processedPayment) {
      return res.json({ success: true });
    }

    const payment = await prisma.payments.findUnique({
      where: {
        sepay_payment_code: paymentCode,
      },
    });

    if (!payment) {
      return res.json({ success: true });
    }

    if (Number(payment.amount) > transferAmount) {
      return res.status(400).json({
        success: false,
        message: "Transfer amount does not match payment amount",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payments.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "SUCCESS",
          payment_time: parseSepayTransactionDate(payload.transactionDate),
          sepay_transaction_id: sepayTransactionId,
          sepay_reference_code: payload.referenceCode || null,
          sepay_payload: payload,
        },
      });

      if (payment.reservation_id) {
        await tx.reservations.update({
          where: {
            id: payment.reservation_id,
          },
          data: {
            status: "CONFIRMED",
          },
        });
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("SePay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
