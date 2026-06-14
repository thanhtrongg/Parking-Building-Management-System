package com.parking.service.impl;

import com.parking.dto.admin.AdminConfigResponse;
import com.parking.dto.user.UserResponse;
import com.parking.entity.User;
import com.parking.enums.SessionStatus;
import com.parking.enums.UserRole;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.UserRepository;
import com.parking.service.AdminService;
import com.parking.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ParkingBuildingRepository buildingRepository;
    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final Environment environment;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(UserRole role, Boolean isActive, String search, Pageable pageable) {
        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<User> usersPage = userRepository.searchUsers(role, isActive, searchPattern, pageable);
        return usersPage.map(this::mapToResponse);
    }

    @Override
    public UserResponse updateUserRole(UUID userId, UserRole role, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new BadRequestException("You cannot change your own role");
        }

        UserRole oldRole = user.getRole();
        user.setRole(role);
        user = userRepository.save(user);
        auditService.log(currentUserEmail, "ROLE_CHANGE", "User", userId,
                "Role changed from " + oldRole + " to " + role);
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateUserStatus(UUID userId, Boolean isActive, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new BadRequestException("You cannot toggle your own active status");
        }

        user.setActive(isActive);
        user = userRepository.save(user);
        auditService.log(currentUserEmail, "STATUS_TOGGLE", "User", userId,
                "Active status set to " + isActive);
        return mapToResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminConfigResponse getSystemConfig() {
        String[] activeProfiles = environment.getActiveProfiles();
        String activeProfile = activeProfiles.length > 0 ? activeProfiles[0] : "default";

        long totalBuildings = buildingRepository.count();
        long totalUsers = userRepository.count();
        long totalActiveSessions = sessionRepository.countByStatus(SessionStatus.ACTIVE);
        long totalSlots = slotRepository.count();

        return AdminConfigResponse.builder()
                .jvmVersion(System.getProperty("java.version"))
                .activeProfile(activeProfile)
                .osName(System.getProperty("os.name"))
                .availableProcessors(Runtime.getRuntime().availableProcessors())
                .totalMemoryMb(Runtime.getRuntime().totalMemory() / (1024 * 1024))
                .freeMemoryMb(Runtime.getRuntime().freeMemory() / (1024 * 1024))
                .totalBuildings(totalBuildings)
                .totalUsers(totalUsers)
                .totalActiveSessions(totalActiveSessions)
                .totalSlots(totalSlots)
                .build();
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .theme(user.getTheme())
                .build();
    }
}
