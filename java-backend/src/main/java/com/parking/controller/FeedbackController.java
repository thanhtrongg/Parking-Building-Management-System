package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.feedback.FeedbackRequest;
import com.parking.dto.feedback.FeedbackResponse;
import com.parking.dto.feedback.FeedbackStatusUpdateRequest;
import com.parking.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Customer feedback management")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Submit new feedback")
    @PostMapping
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> createFeedback(
            @Valid @RequestBody FeedbackRequest request,
            Principal principal) {
        FeedbackResponse response = feedbackService.createFeedback(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully", response));
    }

    @Operation(summary = "Get current driver's feedback")
    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<Page<FeedbackResponse>>> getMyFeedback(
            Principal principal,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<FeedbackResponse> response = feedbackService.getMyFeedback(principal.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Your feedback retrieved successfully", response));
    }

    @Operation(summary = "Get all feedback (manager)")
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getAllFeedback() {
        List<FeedbackResponse> response = feedbackService.getAllFeedback();
        return ResponseEntity.ok(ApiResponse.success("All feedback retrieved successfully", response));
    }

    @Operation(summary = "Update feedback status")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> updateFeedbackStatus(
            @PathVariable UUID id,
            @Valid @RequestBody FeedbackStatusUpdateRequest request) {
        FeedbackResponse response = feedbackService.updateFeedbackStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Feedback status updated successfully", response));
    }
}
