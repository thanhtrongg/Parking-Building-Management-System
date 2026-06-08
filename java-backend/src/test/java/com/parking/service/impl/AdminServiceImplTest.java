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
import com.parking.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AdminServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParkingBuildingRepository buildingRepository;

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private Environment environment;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminServiceImpl adminService;

    private UUID userId;
    private String adminEmail;
    private String userEmail;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        adminEmail = "admin@parking.com";
        userEmail = "staff@parking.com";
    }

    @Test
    void testSearchUsers() {
        User user = User.builder()
                .id(userId)
                .email(userEmail)
                .fullName("Staff User")
                .role(UserRole.STAFF)
                .isActive(true)
                .build();

        Page<User> page = new PageImpl<>(List.of(user));
        Pageable pageable = PageRequest.of(0, 10);

        when(userRepository.searchUsers(any(), any(), any(), eq(pageable)))
                .thenReturn(page);

        Page<UserResponse> result = adminService.searchUsers(UserRole.STAFF, true, "Staff", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(userEmail, result.getContent().get(0).getEmail());
    }

    @Test
    void testUpdateUserRole_Success() {
        User user = User.builder()
                .id(userId)
                .email(userEmail)
                .role(UserRole.STAFF)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = adminService.updateUserRole(userId, UserRole.MANAGER, adminEmail);

        assertNotNull(response);
        assertEquals(UserRole.MANAGER, response.getRole());
    }

    @Test
    void testUpdateUserRole_SelfModification_ThrowsBadRequestException() {
        User user = User.builder()
                .id(userId)
                .email(adminEmail)
                .role(UserRole.ADMIN)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> 
                adminService.updateUserRole(userId, UserRole.STAFF, adminEmail)
        );
    }

    @Test
    void testUpdateUserStatus_Success() {
        User user = User.builder()
                .id(userId)
                .email(userEmail)
                .isActive(true)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = adminService.updateUserStatus(userId, false, adminEmail);

        assertNotNull(response);
        assertFalse(response.isActive());
    }

    @Test
    void testUpdateUserStatus_SelfDeactivation_ThrowsBadRequestException() {
        User user = User.builder()
                .id(userId)
                .email(adminEmail)
                .isActive(true)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> 
                adminService.updateUserStatus(userId, false, adminEmail)
        );
    }

    @Test
    void testGetSystemConfig() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"dev"});
        when(buildingRepository.count()).thenReturn(5L);
        when(userRepository.count()).thenReturn(100L);
        when(sessionRepository.countByStatus(SessionStatus.ACTIVE)).thenReturn(12L);
        when(slotRepository.count()).thenReturn(500L);

        AdminConfigResponse config = adminService.getSystemConfig();

        assertNotNull(config);
        assertEquals("dev", config.getActiveProfile());
        assertEquals(5L, config.getTotalBuildings());
        assertEquals(100L, config.getTotalUsers());
        assertEquals(12L, config.getTotalActiveSessions());
        assertEquals(500L, config.getTotalSlots());
        assertNotNull(config.getJvmVersion());
    }
}
