import prisma from "../config/prisma.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_FEEDBACK_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const RESERVATION_MARKER_PREFIX = "[Reservation:";
const STAFF_REPLY_MARKER_PREFIX = "[Staff Reply:";

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
};

const getReservationCode = (reservationId) => {
  return reservationId ? `RSV-${reservationId.slice(0, 8).toUpperCase()}` : null;
};

const normalizeReservationCode = (value) => {
  const normalizedValue = String(value || "")
    .trim()
    .toUpperCase();

  return normalizedValue.startsWith("RSV-")
    ? normalizedValue
    : `RSV-${normalizedValue}`;
};

const parseFeedbackDescription = (description) => {
  const text = String(description || "");
  const replyMarkerIndex = text.indexOf(STAFF_REPLY_MARKER_PREFIX);
  const customerText =
    replyMarkerIndex === -1 ? text : text.slice(0, replyMarkerIndex).trimEnd();
  const replyText = replyMarkerIndex === -1 ? "" : text.slice(replyMarkerIndex);
  const replyMarkerEndIndex = replyText.indexOf("]");
  const replyCreatedAt =
    replyMarkerEndIndex === -1
      ? null
      : replyText
          .slice(STAFF_REPLY_MARKER_PREFIX.length, replyMarkerEndIndex)
          .trim();
  const replyMessage =
    replyMarkerEndIndex === -1
      ? ""
      : replyText.slice(replyMarkerEndIndex + 1).trimStart();

  if (!customerText.startsWith(RESERVATION_MARKER_PREFIX)) {
    return {
      reservationCode: null,
      message: customerText,
      reply: replyMessage,
      replyCreatedAt,
    };
  }

  const markerEndIndex = customerText.indexOf("]");

  if (markerEndIndex === -1) {
    return {
      reservationCode: null,
      message: customerText,
      reply: replyMessage,
      replyCreatedAt,
    };
  }

  return {
    reservationCode: customerText
      .slice(RESERVATION_MARKER_PREFIX.length, markerEndIndex)
      .trim(),
    message: customerText.slice(markerEndIndex + 1).trimStart(),
    reply: replyMessage,
    replyCreatedAt,
  };
};

const buildFeedbackDescription = (message, reservationCode) => {
  if (!reservationCode) return message;

  return `${RESERVATION_MARKER_PREFIX} ${reservationCode}]\n${message}`;
};

const buildFeedbackDescriptionWithReply = (feedback, reply) => {
  const parsedDescription = parseFeedbackDescription(feedback.description);
  const baseDescription = buildFeedbackDescription(
    parsedDescription.message,
    parsedDescription.reservationCode,
  );

  return `${baseDescription}\n\n${STAFF_REPLY_MARKER_PREFIX} ${new Date().toISOString()}]\n${reply}`;
};

const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toUpperCase();
};

const feedbackInclude = {
  users_feedbacks_user_idTousers: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
    },
  },
  parking_sessions: {
    select: {
      id: true,
      ticket_code: true,
      license_plate: true,
      status: true,
      entry_time: true,
      exit_time: true,
    },
  },
};

const mapFeedbackResponse = (feedback) => {
  const user = feedback.users_feedbacks_user_idTousers;
  const parkingSession = feedback.parking_sessions;
  const parsedDescription = parseFeedbackDescription(feedback.description);

  return {
    id: feedback.id,
    userId: feedback.user_id,
    parkingSessionId: feedback.parking_session_id,
    bookingId: parsedDescription.reservationCode,
    reservationCode: parsedDescription.reservationCode,
    customerName: user?.full_name || null,
    ticketCode: parkingSession?.ticket_code || null,
    subject: feedback.issue_type,
    message: parsedDescription.message,
    reply: parsedDescription.reply || null,
    replyCreatedAt: parsedDescription.replyCreatedAt || null,
    status: feedback.status,
    createdAt: feedback.created_at,
    user: user
      ? {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
        }
      : null,
    parkingSession: parkingSession
      ? {
          id: parkingSession.id,
          ticketCode: parkingSession.ticket_code,
          licensePlate: parkingSession.license_plate,
          status: parkingSession.status,
          entryTime: parkingSession.entry_time,
          exitTime: parkingSession.exit_time,
        }
      : null,
  };
};

const validateUserExists = async (userId) => {
  if (!isValidUUID(userId)) {
    return {
      statusCode: 400,
      message: "Invalid user id",
    };
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return {
      statusCode: 404,
      message: "User not found",
    };
  }

  return null;
};

const validateParkingSessionForUser = async (parkingSessionId, userId) => {
  if (!parkingSessionId) return null;

  if (!isValidUUID(parkingSessionId)) {
    return {
      statusCode: 400,
      message: "Invalid parkingSessionId",
    };
  }

  const parkingSession = await prisma.parking_sessions.findUnique({
    where: { id: parkingSessionId },
    select: {
      id: true,
      user_id: true,
    },
  });

  if (!parkingSession) {
    return {
      statusCode: 404,
      message: "Parking session not found",
    };
  }

  if (parkingSession.user_id !== userId) {
    return {
      statusCode: 403,
      message: "Cannot link feedback to another user's parking session",
    };
  }

  return null;
};

const findReservationByCodeForUser = async (bookingCode, userId) => {
  const normalizedCode = normalizeReservationCode(bookingCode);

  const reservations = await prisma.reservations.findMany({
    where: {
      user_id: userId,
    },
    select: {
      id: true,
    },
  });

  const reservation = reservations.find((item) => {
    return getReservationCode(item.id) === normalizedCode;
  });

  return reservation
    ? {
        reservation,
        reservationCode: normalizedCode,
      }
    : null;
};

const validateReservationForUser = async ({
  bookingId,
  reservationId,
  reservationCode,
  userId,
}) => {
  const rawReservationValue = bookingId || reservationId || reservationCode;
  if (!rawReservationValue) {
    return {
      statusCode: 400,
      message: "Booking ID is required",
    };
  }

  if (isValidUUID(rawReservationValue)) {
    const reservation = await prisma.reservations.findUnique({
      where: {
        id: rawReservationValue,
      },
      select: {
        id: true,
        user_id: true,
      },
    });

    if (!reservation) {
      return {
        statusCode: 404,
        message: "Reservation not found",
      };
    }

    if (reservation.user_id !== userId) {
      return {
        statusCode: 403,
        message: "Cannot link feedback to another user's booking",
      };
    }

    return {
      reservationCode: getReservationCode(reservation.id),
    };
  }

  const matchedReservation = await findReservationByCodeForUser(
    rawReservationValue,
    userId,
  );

  if (!matchedReservation) {
    return {
      statusCode: 404,
      message: "Booking not found for current user",
    };
  }

  return {
    reservationCode: matchedReservation.reservationCode,
  };
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.feedbacks.findMany({
      include: feedbackInclude,
      orderBy: {
        created_at: "desc",
      },
    });

    return res.json({
      success: true,
      message: "Get feedbacks successfully",
      data: feedbacks.map(mapFeedbackResponse),
    });
  } catch (error) {
    console.error("Get feedbacks error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getMyFeedbacks = async (req, res) => {
  try {
    const status = req.query.status ? normalizeStatus(req.query.status) : "";

    if (status && !VALID_FEEDBACK_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid feedback status. Allowed values: OPEN, IN_PROGRESS, RESOLVED, CLOSED",
      });
    }

    const feedbacks = await prisma.feedbacks.findMany({
      where: {
        user_id: req.user.id,
        ...(status ? { status } : {}),
      },
      include: feedbackInclude,
      orderBy: {
        created_at: "desc",
      },
    });

    return res.json({
      success: true,
      message: "Get my feedbacks successfully",
      data: feedbacks.map(mapFeedbackResponse),
    });
  } catch (error) {
    console.error("Get my feedbacks error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback id",
      });
    }

    const feedback = await prisma.feedbacks.findUnique({
      where: { id },
      include: feedbackInclude,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    return res.json({
      success: true,
      message: "Get feedback detail successfully",
      data: mapFeedbackResponse(feedback),
    });
  } catch (error) {
    console.error("Get feedback detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createFeedback = async (req, res) => {
  try {
    const {
      parkingSessionId,
      bookingId,
      reservationId,
      reservationCode,
      subject,
      message,
    } = req.body;
    const userId = req.user.id;

    const normalizedSubject = String(subject || "").trim();
    const normalizedMessage = String(message || "").trim();

    if (!normalizedSubject || !normalizedMessage) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    const userError = await validateUserExists(userId);
    if (userError) {
      return res.status(userError.statusCode).json({
        success: false,
        message: userError.message,
      });
    }

    const parkingSessionError = await validateParkingSessionForUser(
      parkingSessionId,
      userId,
    );
    if (parkingSessionError) {
      return res.status(parkingSessionError.statusCode).json({
        success: false,
        message: parkingSessionError.message,
      });
    }

    const reservationResult = await validateReservationForUser({
      bookingId,
      reservationId,
      reservationCode,
      userId,
    });

    if (reservationResult?.statusCode) {
      return res.status(reservationResult.statusCode).json({
        success: false,
        message: reservationResult.message,
      });
    }

    const feedback = await prisma.feedbacks.create({
      data: {
        user_id: userId,
        parking_session_id: parkingSessionId || null,
        issue_type: normalizedSubject,
        description: buildFeedbackDescription(
          normalizedMessage,
          reservationResult?.reservationCode,
        ),
        status: "OPEN",
      },
      include: feedbackInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: mapFeedbackResponse(feedback),
    });
  } catch (error) {
    console.error("Create feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const nextStatus = normalizeStatus(req.body.status);

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback id",
      });
    }

    if (!VALID_FEEDBACK_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid feedback status. Allowed values: OPEN, IN_PROGRESS, RESOLVED, CLOSED",
      });
    }

    const feedback = await prisma.feedbacks.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    const updatedFeedback = await prisma.feedbacks.update({
      where: { id },
      data: {
        status: nextStatus,
        resolved_by: ["RESOLVED", "CLOSED"].includes(nextStatus)
          ? req.user.id
          : null,
      },
      include: feedbackInclude,
    });

    return res.json({
      success: true,
      message: "Update feedback status successfully",
      data: mapFeedbackResponse(updatedFeedback),
    });
  } catch (error) {
    console.error("Update feedback status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateFeedbackReply = async (req, res) => {
  try {
    const { id } = req.params;
    const reply = String(req.body.reply || "").trim();

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback id",
      });
    }

    if (!reply) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const feedback = await prisma.feedbacks.findUnique({
      where: { id },
      include: feedbackInclude,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    const updatedFeedback = await prisma.feedbacks.update({
      where: { id },
      data: {
        description: buildFeedbackDescriptionWithReply(feedback, reply),
        resolved_by: req.user.id,
      },
      include: feedbackInclude,
    });

    return res.json({
      success: true,
      message: "Reply saved successfully",
      data: mapFeedbackResponse(updatedFeedback),
    });
  } catch (error) {
    console.error("Update feedback reply error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
