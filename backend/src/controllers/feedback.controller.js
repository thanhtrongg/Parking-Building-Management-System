import prisma from "../config/prisma.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_FEEDBACK_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
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

  return {
    id: feedback.id,
    userId: feedback.user_id,
    parkingSessionId: feedback.parking_session_id,
    customerName: user?.full_name || null,
    ticketCode: parkingSession?.ticket_code || null,
    subject: feedback.issue_type,
    message: feedback.description,
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
    const { parkingSessionId, subject, message } = req.body;
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

    const feedback = await prisma.feedbacks.create({
      data: {
        user_id: userId,
        parking_session_id: parkingSessionId || null,
        issue_type: normalizedSubject,
        description: normalizedMessage,
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
