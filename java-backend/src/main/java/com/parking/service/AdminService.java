package com.parking.service;

import com.parking.dto.admin.AdminConfigResponse;
import com.parking.dto.user.UserResponse;
import com.parking.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminService {

    Page<UserResponse> searchUsers(UserRole role, Boolean isActive, String search, Pageable pageable);

    UserResponse updateUserRole(UUID userId, UserRole role, String currentUserEmail);

    UserResponse updateUserStatus(UUID userId, Boolean isActive, String currentUserEmail);

    AdminConfigResponse getSystemConfig();
}
