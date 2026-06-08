package com.parking.dto.feedback;

import com.parking.enums.FeedbackStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackStatusUpdateRequest {

    @NotNull(message = "Feedback status is required")
    private FeedbackStatus status;
}
