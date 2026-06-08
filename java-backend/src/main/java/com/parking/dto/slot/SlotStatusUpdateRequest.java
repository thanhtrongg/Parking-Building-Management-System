package com.parking.dto.slot;

import com.parking.enums.SlotStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SlotStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private SlotStatus status;
}
