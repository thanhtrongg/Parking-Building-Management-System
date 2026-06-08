package com.parking.service;

import com.parking.dto.feedback.FeedbackRequest;
import com.parking.dto.feedback.FeedbackResponse;
import com.parking.dto.feedback.FeedbackStatusUpdateRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface FeedbackService {

    FeedbackResponse createFeedback(FeedbackRequest request, String currentUserEmail);

    Page<FeedbackResponse> getMyFeedback(String currentUserEmail, Pageable pageable);

    List<FeedbackResponse> getAllFeedback();

    FeedbackResponse updateFeedbackStatus(UUID id, FeedbackStatusUpdateRequest request);
}
