package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.admin.AdminConfigResponse;
import com.parking.dto.admin.UserRoleUpdateRequest;
import com.parking.dto.admin.UserStatusUpdateRequest;
import com.parking.dto.user.UserResponse;
import com.parking.enums.UserRole;
import com.parking.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administrative user and system management")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Search users with optional filters")
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<UserResponse> response = adminService.searchUsers(role, isActive, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", response));
    }

    @Operation(summary = "Update a user's role")
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UserRoleUpdateRequest request,
            Principal principal) {

        UserResponse response = adminService.updateUserRole(id, request.getRole(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", response));
    }

    @Operation(summary = "Update a user's active status")
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserStatusUpdateRequest request,
            Principal principal) {

        UserResponse response = adminService.updateUserStatus(id, request.getActive(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("User active status updated successfully", response));
    }

    @Operation(summary = "Get system configuration")
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<AdminConfigResponse>> getSystemConfig() {
        AdminConfigResponse response = adminService.getSystemConfig();
        return ResponseEntity.ok(ApiResponse.success("System config retrieved successfully", response));
    }
}
