package com.parking.service;

import com.parking.dto.feedback.FeedbackRequest;
import com.parking.dto.feedback.FeedbackResponse;
import com.parking.dto.feedback.FeedbackStatusUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface FeedbackService {

    FeedbackResponse createFeedback(FeedbackRequest request, String currentUserEmail);

    List<FeedbackResponse> getMyFeedback(String currentUserEmail);

    List<FeedbackResponse> getAllFeedback();

    FeedbackResponse updateFeedbackStatus(UUID id, FeedbackStatusUpdateRequest request);
}
