import prisma from "../config/prisma.js";
import { getFeeForVehicleType } from "../services/pricing.service.js";

const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const MAX_HISTORY_MESSAGES = 8;
const SYSTEM_ROLES = new Set(["ADMIN", "MANAGER", "STAFF"]);

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const VEHICLE_ALIASES = {
  "o to": ["car", "automobile"],
  "xe may": ["motorbike", "motorcycle"],
  "xe dap": ["bike", "bicycle"],
  "xe dien": ["electric vehicle", "ev"],
  "xe tai nho": ["small truck", "truck"],
};

const formatMoney = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VND`;

const findMentionedSlot = async (message) => {
  const tokens = String(message)
    .toUpperCase()
    .match(/[A-Z0-9]+(?:-[A-Z0-9]+)+/g);

  if (!tokens?.length) return null;

  return prisma.parking_slots.findFirst({
    where: {
      slot_name: {
        equals: tokens[0],
        mode: "insensitive",
      },
    },
    include: {
      zones: {
        include: {
          vehicle_types: true,
        },
      },
    },
  });
};

const getPricingContext = async (message) => {
  const vehicleTypes = await prisma.vehicle_types.findMany({
    orderBy: { type_name: "asc" },
  });
  const normalizedMessage = normalizeText(message);
  const vehicleType =
    vehicleTypes.find((item) =>
      normalizedMessage.includes(normalizeText(item.type_name)),
    ) ||
    vehicleTypes.find((item) =>
      (VEHICLE_ALIASES[normalizeText(item.type_name)] || []).some((alias) =>
        normalizedMessage.includes(alias),
      ),
    ) ||
    null;
  const policies = await prisma.pricing_policies.findMany({
    where: vehicleType ? { vehicle_type_id: vehicleType.id } : {},
    include: { vehicle_types: true },
    orderBy: { effective_date: "desc" },
    take: vehicleType ? 1 : 12,
  });

  const hourMatch = normalizedMessage.match(
    /(\d+(?:[.,]\d+)?)\s*(?:gio|hours?|hrs?|h)\b/,
  );
  let estimate = null;

  if (hourMatch && vehicleType) {
    const hours = Math.max(1, Math.ceil(Number(hourMatch[1].replace(",", "."))));
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
    estimate = {
      vehicleType: vehicleType.type_name,
      durationHours: hours,
      ...(await getFeeForVehicleType(vehicleType.id, startTime, endTime)),
    };
  }

  return {
    vehicleTypes: vehicleTypes.map((item) => item.type_name),
    policies: policies.map((policy) => ({
      vehicleType: policy.vehicle_types?.type_name || "All vehicles",
      basePrice: Number(policy.base_price),
      hourlyRate: Number(policy.hourly_rate || 0),
      nightRate: Number(policy.night_rate || 0),
      effectiveDate: policy.effective_date,
    })),
    estimate,
  };
};

const getRoleContext = async (user) => {
  if (!user) return { audience: "PUBLIC" };

  if (SYSTEM_ROLES.has(user.role)) {
    const [activeSessions, confirmedReservations, openFeedbacks, availableSlots] =
      await Promise.all([
        prisma.parking_sessions.count({ where: { status: "ACTIVE" } }),
        prisma.reservations.count({ where: { status: "CONFIRMED" } }),
        prisma.feedbacks.count({ where: { status: "OPEN" } }),
        prisma.parking_slots.count({ where: { status: "AVAILABLE" } }),
      ]);

    return {
      audience: user.role,
      operationalSummary: {
        activeSessions,
        confirmedReservations,
        openFeedbacks,
        availableSlots,
      },
    };
  }

  const [reservations, sessions] = await Promise.all([
    prisma.reservations.findMany({
      where: { user_id: user.id },
      include: { parking_slots: true, vehicle_types: true },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    prisma.parking_sessions.findMany({
      where: { user_id: user.id },
      include: {
        vehicle_types: true,
        parking_slots_parking_sessions_parking_slot_idToparking_slots: true,
      },
      orderBy: { entry_time: "desc" },
      take: 5,
    }),
  ]);

  return {
    audience: "USER",
    ownRecentReservations: reservations.map((item) => ({
      slot: item.parking_slots?.slot_name || null,
      vehicleType: item.vehicle_types?.type_name || null,
      licensePlate: item.license_plate,
      startTime: item.expected_start_time,
      endTime: item.expected_end_time,
      status: item.status,
    })),
    ownRecentSessions: sessions.map((item) => ({
      ticketCode: item.ticket_code,
      slot:
        item.parking_slots_parking_sessions_parking_slot_idToparking_slots
          ?.slot_name || null,
      licensePlate: item.license_plate,
      entryTime: item.entry_time,
      exitTime: item.exit_time,
      status: item.status,
    })),
  };
};

const buildContext = async (message, user) => {
  const [slot, pricing, role] = await Promise.all([
    findMentionedSlot(message),
    getPricingContext(message),
    getRoleContext(user),
  ]);

  return {
    currentTime: new Date().toISOString(),
    slot: slot
      ? {
          code: slot.slot_name,
          status: slot.status,
          distanceToGate: slot.distance_to_gate,
          zone: slot.zones?.zone_name || null,
          vehicleType: slot.zones?.vehicle_types?.type_name || null,
        }
      : null,
    pricing,
    role,
  };
};

const fallbackReply = (message, context) => {
  if (context.slot) {
    const status =
      context.slot.status === "AVAILABLE"
        ? "đang còn trống"
        : `hiện có trạng thái ${context.slot.status}`;
    return `Vị trí ${context.slot.code} ${status}. Khu vực: ${context.slot.zone || "chưa xác định"}, loại xe: ${context.slot.vehicleType || "chưa xác định"}, cách cổng ${context.slot.distanceToGate || 0} m.`;
  }

  if (context.pricing.estimate) {
    const estimate = context.pricing.estimate;
    return `Phí ước tính cho ${estimate.vehicleType} trong ${estimate.durationHours} giờ là ${formatMoney(estimate.totalAmount)}. Đây là mức ước tính theo bảng giá hiện hành; phí thực tế phụ thuộc thời điểm check-out.`;
  }

  if (/(?:gia|price|phi|fee)/i.test(normalizeText(message))) {
    const lines = context.pricing.policies.slice(0, 6).map(
      (policy) =>
        `${policy.vehicleType}: giá cơ bản ${formatMoney(policy.basePrice)}, thêm giờ ${formatMoney(policy.hourlyRate)}/giờ, ban đêm ${formatMoney(policy.nightRate)}/giờ`,
    );
    return lines.length
      ? `Bảng giá hiện hành:\n${lines.join("\n")}`
      : "Hiện chưa có bảng giá để tra cứu.";
  }

  if (context.role.operationalSummary) {
    const summary = context.role.operationalSummary;
    return `Tổng quan hiện tại: ${summary.availableSlots} chỗ trống, ${summary.activeSessions} phiên đang hoạt động, ${summary.confirmedReservations} đặt chỗ đã xác nhận và ${summary.openFeedbacks} phản hồi đang mở.`;
  }

  return "Mình có thể tra cứu bảng giá, ước tính phí theo loại xe và số giờ, hoặc kiểm tra một vị trí khi bạn cung cấp đúng mã slot, ví dụ B-C1-001.";
};

const askGemini = async (message, history, context) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `You are ParkMaster Assistant for a parking building management system.
Reply in the same language as the user, naturally and concisely.
Use only the supplied live context for prices, availability, bookings, sessions, and operations.
Never invent data. If a slot code is missing, ask the user to provide it. Do not recommend or assign slots.
Public visitors may only receive public parking information. Authenticated users may only receive data included for their role.
Clearly label fee calculations as estimates.`,
            },
          ],
        },
        contents: [
          ...history.slice(-MAX_HISTORY_MESSAGES).map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: String(item.content || "").slice(0, 2000) }],
          })),
          {
            role: "user",
            parts: [
              {
                text: `Live context:\n${JSON.stringify(context)}\n\nQuestion:\n${message}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 600,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${detail}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
};

export const chatWithAssistant = async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (message.length > 1500) {
      return res.status(400).json({
        success: false,
        message: "Message is too long",
      });
    }

    const context = await buildContext(message, req.user);
    let reply;
    let source = "local";

    try {
      reply = await askGemini(message, history, context);
      if (reply) source = "gemini";
    } catch (error) {
      console.error("Gemini assistant error:", error.message);
    }

    return res.json({
      success: true,
      data: {
        reply: reply || fallbackReply(message, context),
        source,
        audience: context.role.audience,
      },
    });
  } catch (error) {
    console.error("Assistant chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Assistant is temporarily unavailable",
    });
  }
};
