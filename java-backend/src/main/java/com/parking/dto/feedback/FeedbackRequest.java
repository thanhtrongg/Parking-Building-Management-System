package com.parking.dto.feedback;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class FeedbackRequest {

    private String category;

    @NotBlank(message = "Feedback content is required")
    private String content;

    private UUID sessionId;
}
