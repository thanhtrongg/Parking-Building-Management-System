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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FeedbackServiceImplTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParkingSessionRepository sessionRepository;

    @InjectMocks
    private FeedbackServiceImpl feedbackService;

    @Test
    @DisplayName("Create feedback success")
    void testCreateFeedback_Success() {
        String email = "driver@parking.com";
        User driver = User.builder().id(UUID.randomUUID()).email(email).fullName("John Doe").build();

        FeedbackRequest request = new FeedbackRequest();
        request.setCategory("ISSUE");
        request.setContent("Broken gate");

        Feedback feedback = Feedback.builder()
                .id(UUID.randomUUID())
                .driver(driver)
                .category("ISSUE")
                .content("Broken gate")
                .status(FeedbackStatus.OPEN)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(feedback);

        FeedbackResponse response = feedbackService.createFeedback(request, email);

        assertNotNull(response);
        assertEquals("Broken gate", response.getContent());
        assertEquals(FeedbackStatus.OPEN, response.getStatus());
    }

    @Test
    @DisplayName("Get my feedback - success")
    void testGetMyFeedback_Success() {
        String email = "driver@parking.com";
        UUID driverId = UUID.randomUUID();
        User driver = User.builder().id(driverId).email(email).fullName("John Doe").build();

        Feedback feedback = Feedback.builder()
                .id(UUID.randomUUID())
                .driver(driver)
                .category("ISSUE")
                .content("Broken gate")
                .status(FeedbackStatus.OPEN)
                .build();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Feedback> page = new PageImpl<>(List.of(feedback), pageable, 1);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));
        when(feedbackRepository.findByDriverId(driverId, pageable)).thenReturn(page);

        Page<FeedbackResponse> response = feedbackService.getMyFeedback(email, pageable);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals("Broken gate", response.getContent().get(0).getContent());
    }

    @Test
    @DisplayName("Create feedback - driver not owning session - throws AccessDeniedException")
    void testCreateFeedback_DriverNotOwningSession_ThrowsAccessDeniedException() {
        String email = "hacker@parking.com";
        User hacker = User.builder().id(UUID.randomUUID()).email(email).build();
        User victim = User.builder().id(UUID.randomUUID()).email("victim@parking.com").build();

        FeedbackRequest request = new FeedbackRequest();
        request.setCategory("ISSUE");
        request.setContent("Broken gate");
        UUID sessionId = UUID.randomUUID();
        request.setSessionId(sessionId);

        ParkingSession session = ParkingSession.builder()
                .id(sessionId)
                .driver(victim)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(hacker));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                feedbackService.createFeedback(request, email));
    }
}
