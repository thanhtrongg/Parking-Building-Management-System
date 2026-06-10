package com.parking.dto.feedback;

import com.parking.enums.FeedbackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {

    private UUID id;
    private String category;
    private String content;
    private FeedbackStatus status;
    private LocalDateTime createdAt;
    private UUID driverId;
    private String driverName;
    private String driverEmail;
    private String driverPhone;
    private UUID sessionId;
    private String ticketCode;
}
