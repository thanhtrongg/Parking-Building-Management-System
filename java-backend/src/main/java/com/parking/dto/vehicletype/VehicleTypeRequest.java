package com.parking.dto.vehicletype;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VehicleTypeRequest {

    @NotBlank(message = "Vehicle type name is required")
    private String name;

    private String description;

    public void setTypeName(String typeName) {
        this.name = typeName;
    }
}
