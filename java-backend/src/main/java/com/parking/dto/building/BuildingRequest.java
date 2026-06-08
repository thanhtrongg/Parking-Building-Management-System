package com.parking.dto.building;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalTime;

@Data
public class BuildingRequest {

    @NotBlank(message = "Building name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    private String phone;
    private LocalTime openingTime;
    private LocalTime closingTime;
}
