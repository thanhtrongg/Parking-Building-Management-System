package com.parking.dto.rule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParkingRuleRequest {

    @NotNull(message = "Building ID is required")
    private UUID buildingId;

    @NotBlank(message = "Rule title is required")
    private String title;

    @NotBlank(message = "Rule content is required")
    private String content;

    private int displayOrder;

    @Builder.Default
    private boolean isActive = true;
}
