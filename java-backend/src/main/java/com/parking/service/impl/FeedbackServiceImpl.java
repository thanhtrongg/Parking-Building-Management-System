package com.parking.service.impl;

import com.parking.dto.feedback.FeedbackRequest;
import com.parking.dto.feedback.FeedbackResponse;
import com.parking.dto.feedback.FeedbackStatusUpdateRequest;
import com.parking.entity.Feedback;
import com.parking.entity.ParkingSession;
import com.parking.entity.User;
import com.parking.enums.FeedbackStatus;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FeedbackRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.UserRepository;
import com.parking.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ParkingSessionRepository sessionRepository;

    @Override
    public FeedbackResponse createFeedback(FeedbackRequest request, String currentUserEmail) {
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        ParkingSession session = null;
        if (request.getSessionId() != null) {
            session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + request.getSessionId()));
        }

        Feedback feedback = Feedback.builder()
                .driver(driver)
                .session(session)
                .category(request.getCategory())
                .content(request.getContent())
                .status(FeedbackStatus.OPEN)
                .build();

        feedback = feedbackRepository.save(feedback);
        return mapToResponse(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getMyFeedback(String currentUserEmail) {
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        return feedbackRepository.findByDriverId(driver.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackResponse updateFeedbackStatus(UUID id, FeedbackStatusUpdateRequest request) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));

        feedback.setStatus(request.getStatus());
        feedback = feedbackRepository.save(feedback);
        return mapToResponse(feedback);
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .category(feedback.getCategory())
                .content(feedback.getContent())
                .status(feedback.getStatus())
                .createdAt(feedback.getCreatedAt())
                .driverId(feedback.getDriver().getId())
                .driverName(feedback.getDriver().getFullName())
                .sessionId(feedback.getSession() != null ? feedback.getSession().getId() : null)
                .ticketCode(feedback.getSession() != null ? feedback.getSession().getTicketCode() : null)
                .build();
    }
}
