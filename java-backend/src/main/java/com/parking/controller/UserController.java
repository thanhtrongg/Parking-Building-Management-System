package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.user.UserPasswordUpdateRequest;
import com.parking.dto.user.UserProfileUpdateRequest;
import com.parking.dto.user.UserResponse;
import com.parking.dto.user.UserThemeUpdateRequest;
import com.parking.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints for managing user profiles, settings, and theme preferences")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get the authenticated user's profile details")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Principal principal) {
        UserResponse response = userService.getProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @Operation(summary = "Update the authenticated user's profile details")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UserProfileUpdateRequest request,
            Principal principal) {
        UserResponse response = userService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @Operation(summary = "Update the authenticated user's password")
    @PatchMapping("/profile/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @Valid @RequestBody UserPasswordUpdateRequest request,
            Principal principal) {
        userService.updatePassword(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", null));
    }

    @Operation(summary = "Update the authenticated user's theme preference")
    @PatchMapping("/profile/theme")
    public ResponseEntity<ApiResponse<UserResponse>> updateTheme(
            @Valid @RequestBody UserThemeUpdateRequest request,
            Principal principal) {
        UserResponse response = userService.updateTheme(principal.getName(), request.getTheme());
        return ResponseEntity.ok(ApiResponse.success("Theme preference updated successfully", response));
    }
}
