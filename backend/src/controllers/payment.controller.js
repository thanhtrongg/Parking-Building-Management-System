import prisma from "../config/prisma.js";
import { getFeeForVehicleType } from "../services/pricing.service.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

const extractPaymentCode = (payload) => {
  if (payload.code) return String(payload.code);

  const content = String(
    payload.content || payload.description || payload.transferContent || "",
  );
  const match = content.match(/PBMS[A-Z0-9]{12}/i);

  return match ? match[0].toUpperCase() : "";
};

const processSepayPaymentPayload = async (payload) => {
  const sepayTransactionId = payload.id ? String(payload.id) : "";
  const paymentCode = extractPaymentCode(payload);
  const transferAmount = toPositiveAmount(payload.transferAmount);

  if (!sepayTransactionId || !paymentCode || !transferAmount) {
    return {
      statusCode: 400,
      body: {
        success: false,
        message: "Invalid payload",
      },
    };
  }

  if (payload.transferType && payload.transferType !== "in") {
    return {
      statusCode: 200,
      body: { success: true },
    };
  }

  const processedPayment = await prisma.payments.findFirst({
    where: {
      sepay_transaction_id: sepayTransactionId,
    },
  });

  if (processedPayment) {
    return {
      statusCode: 200,
      body: { success: true },
    };
  }

  const payment = await prisma.payments.findUnique({
    where: {
      sepay_payment_code: paymentCode,
    },
  });

  if (!payment) {
    return {
      statusCode: 200,
      body: { success: true },
    };
  }

  if (Number(payment.amount) > transferAmount) {
    return {
      statusCode: 400,
      body: {
        success: false,
        message: "Transfer amount does not match payment amount",
      },
    };
  }

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const nextPayment = await tx.payments.update({
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

    return nextPayment;
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      data: mapPayment(updatedPayment),
    },
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

        r.id AS "reservationIdFromReservation",
        r.expected_start_time AS "reservationStartTime",
        r.expected_end_time AS "reservationEndTime",
        r.status AS "reservationStatus",

        COALESCE(su.id, ru.id) AS "userId",
        COALESCE(su.full_name, ru.full_name) AS "fullName",
        COALESCE(su.email, ru.email) AS "email",
        COALESCE(su.phone, ru.phone) AS "phone",

        COALESCE(svt.id, rvt.id) AS "vehicleTypeId",
        COALESCE(svt.type_name, rvt.type_name) AS "vehicleTypeName",

        COALESCE(ss.id, rs.id) AS "parkingSlotId",
        COALESCE(ss.slot_name, rs.slot_name) AS "slotName",

        COALESCE(sz.id, rz.id) AS "zoneId",
        COALESCE(sz.zone_name, rz.zone_name) AS "zoneName"
      FROM payments p
      LEFT JOIN parking_sessions ps ON p.parking_session_id = ps.id
      LEFT JOIN reservations r ON p.reservation_id = r.id
      LEFT JOIN users su ON ps.user_id = su.id
      LEFT JOIN users ru ON r.user_id = ru.id
      LEFT JOIN vehicle_types svt ON ps.vehicle_type_id = svt.id
      LEFT JOIN vehicle_types rvt ON r.vehicle_type_id = rvt.id
      LEFT JOIN parking_slots ss ON ps.parking_slot_id = ss.id
      LEFT JOIN parking_slots rs ON r.parking_slot_id = rs.id
      LEFT JOIN zones sz ON ss.zone_id = sz.id
      LEFT JOIN zones rz ON rs.zone_id = rz.id
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

    const result = await processSepayPaymentPayload(req.body || {});

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error("SePay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const simulateSepaySandboxPayment = async (req, res) => {
  try {
    const { paymentCode } = req.body;

    if (!paymentCode) {
      return res.status(400).json({
        success: false,
        message: "paymentCode is required",
      });
    }

    const payment = await prisma.payments.findUnique({
      where: {
        sepay_payment_code: String(paymentCode).toUpperCase(),
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.json({
        success: true,
        message: "Payment already succeeded",
        data: mapPayment(payment),
      });
    }

    const now = new Date();
    const payload = {
      id: `SANDBOX-${Date.now()}`,
      gateway: process.env.SEPAY_BANK_CODE || "SANDBOX",
      transactionDate: now.toISOString().slice(0, 19).replace("T", " "),
      accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || "LOCALHOST",
      code: payment.sepay_payment_code,
      content: payment.sepay_payment_code,
      transferType: "in",
      transferAmount: Number(payment.amount),
      accumulated: Number(payment.amount),
      subAccount: null,
      referenceCode: `LOCAL-${Date.now()}`,
      description: "Local SePay sandbox simulation",
    };

    const result = await processSepayPaymentPayload(payload);

    return res.status(result.statusCode).json({
      ...result.body,
      message: "Simulated SePay sandbox payment successfully",
    });
  } catch (error) {
    console.error("Simulate SePay sandbox payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
