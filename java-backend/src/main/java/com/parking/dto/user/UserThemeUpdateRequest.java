package com.parking.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserThemeUpdateRequest {
    @NotBlank(message = "Theme is required")
    private String theme;
}
