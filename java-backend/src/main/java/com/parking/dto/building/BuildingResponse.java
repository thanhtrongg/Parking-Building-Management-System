package com.parking.dto.building;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildingResponse {

    private UUID id;
    private String name;
    private String address;
    private String phone;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private boolean active;
    private int totalFloors;
    private int totalSlots;
    private int availableSlots;
    private LocalDateTime createdAt;
}
