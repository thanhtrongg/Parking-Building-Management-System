import prisma from "../config/prisma.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
};

const mapFeedbackResponse = (feedback) => {
  return {
    id: feedback.id,
    parkingSessionId: feedback.parking_session_id,
    subject: feedback.issue_type,
    message: feedback.description,
    status: feedback.status,
    createdAt: feedback.created_at,
  };
};

export const createUserFeedback = async (req, res) => {
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

    if (parkingSessionId) {
      if (!isValidUUID(parkingSessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parkingSessionId",
        });
      }

      const parkingSession = await prisma.parking_sessions.findUnique({
        where: {
          id: parkingSessionId,
        },
        select: {
          id: true,
          user_id: true,
        },
      });

      if (!parkingSession) {
        return res.status(404).json({
          success: false,
          message: "Parking session not found",
        });
      }

      if (parkingSession.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Cannot link feedback to another user's parking session",
        });
      }
    }

    const feedback = await prisma.feedbacks.create({
      data: {
        user_id: userId,
        parking_session_id: parkingSessionId || null,
        issue_type: normalizedSubject,
        description: normalizedMessage,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: mapFeedbackResponse(feedback),
    });
  } catch (error) {
    console.error("Create user feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
