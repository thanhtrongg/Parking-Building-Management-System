package com.parking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dto.admin.AdminConfigResponse;
import com.parking.dto.admin.UserRoleUpdateRequest;
import com.parking.dto.admin.UserStatusUpdateRequest;
import com.parking.dto.report.OccupancyReportResponse;
import com.parking.dto.report.PeakHoursReportResponse;
import com.parking.dto.report.RevenueReportResponse;
import com.parking.dto.session.SessionResponse;
import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;
import com.parking.dto.user.UserResponse;
import com.parking.enums.SlotStatus;
import com.parking.enums.UserRole;
import com.parking.enums.VehicleTypeEnum;
import com.parking.service.AdminService;
import com.parking.service.ReportService;
import com.parking.service.SlotService;
import com.parking.service.PaymentService;
import com.parking.service.VNPayService;
import com.parking.service.ParkingSessionService;
import com.parking.service.FeedbackService;
import com.parking.dto.feedback.FeedbackResponse;
import com.parking.dto.payment.VNPayResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ControllerE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.parking.security.JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private SlotService slotService;

    @MockitoBean
    private ReportService reportService;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private VNPayService vnpayService;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private ParkingSessionService parkingSessionService;

    @MockitoBean
    private FeedbackService feedbackService;

    @MockitoBean
    private com.parking.service.VehicleTypeService vehicleTypeService;

    // --- SLOT CONTROLLER TESTS ---

    @Test
    @DisplayName("GET /api/v1/slots/floor/{floorId} - success")
    @WithMockUser(roles = "DRIVER")
    void testGetSlotsByFloor() throws Exception {
        UUID floorId = UUID.randomUUID();
        SlotResponse response = SlotResponse.builder()
                .id(UUID.randomUUID())
                .slotCode("A-01")
                .status(SlotStatus.AVAILABLE)
                .build();

        when(slotService.getSlotsByFloor(floorId)).thenReturn(List.of(response));

        mockMvc.perform(get("/slots/floor/" + floorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].slotCode").value("A-01"));
    }

    @Test
    @DisplayName("GET /api/v1/slots/floor/{floorId} - success for guest")
    void testGetSlotsByFloor_asGuest() throws Exception {
        UUID floorId = UUID.randomUUID();
        SlotResponse response = SlotResponse.builder()
                .id(UUID.randomUUID())
                .slotCode("A-01")
                .status(SlotStatus.AVAILABLE)
                .build();

        when(slotService.getSlotsByFloor(floorId)).thenReturn(List.of(response));

        mockMvc.perform(get("/slots/floor/" + floorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].slotCode").value("A-01"));
    }

    @Test
    @DisplayName("GET /api/v1/slots/floor/{floorId}/available - success for guest")
    void testGetAvailableSlotsByFloor_asGuest() throws Exception {
        UUID floorId = UUID.randomUUID();
        SlotResponse response = SlotResponse.builder()
                .id(UUID.randomUUID())
                .slotCode("A-01")
                .status(SlotStatus.AVAILABLE)
                .build();

        when(slotService.getAvailableSlotsByFloor(floorId)).thenReturn(List.of(response));

        mockMvc.perform(get("/slots/floor/" + floorId + "/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].slotCode").value("A-01"));
    }

    @Test
    @DisplayName("GET /api/v1/vehicle-types - success for guest")
    void testGetVehicleTypes_asGuest() throws Exception {
        com.parking.dto.vehicletype.VehicleTypeResponse response = com.parking.dto.vehicletype.VehicleTypeResponse.builder()
                .id(UUID.randomUUID())
                .name("CAR")
                .description("Private cars")
                .build();

        when(vehicleTypeService.getAllVehicleTypes()).thenReturn(List.of(response));

        mockMvc.perform(get("/vehicle-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("CAR"));
    }

    @Test
    @DisplayName("POST /api/v1/slots/recommend - success")
    @WithMockUser(roles = "DRIVER")
    void testRecommendSlot() throws Exception {
        SlotRecommendRequest request = new SlotRecommendRequest(UUID.randomUUID(), VehicleTypeEnum.CAR);
        SlotRecommendResponse response = SlotRecommendResponse.builder()
                .slot(SlotResponse.builder().slotCode("R-01").build())
                .recommendationReason("Nearest available")
                .build();

        when(slotService.recommendSlot(any(SlotRecommendRequest.class))).thenReturn(response);

        mockMvc.perform(post("/slots/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slot.slotCode").value("R-01"));
    }

    @Test
    @DisplayName("PATCH /api/v1/slots/{id}/status - unauthorized for driver")
    @WithMockUser(roles = "DRIVER")
    void testUpdateSlotStatus_unauthorized() throws Exception {
        UUID slotId = UUID.randomUUID();
        SlotStatusUpdateRequest request = new SlotStatusUpdateRequest();
        request.setStatus(SlotStatus.OCCUPIED);

        mockMvc.perform(patch("/slots/" + slotId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/v1/slots/{id}/status - authorized for staff")
    @WithMockUser(roles = "STAFF")
    void testUpdateSlotStatus_authorized() throws Exception {
        UUID slotId = UUID.randomUUID();
        SlotStatusUpdateRequest request = new SlotStatusUpdateRequest();
        request.setStatus(SlotStatus.OCCUPIED);

        SlotResponse response = SlotResponse.builder()
                .id(slotId)
                .slotCode("A-01")
                .status(SlotStatus.OCCUPIED)
                .build();

        when(slotService.updateSlotStatus(eq(slotId), any(SlotStatusUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/slots/" + slotId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("OCCUPIED"));
    }

    // --- REPORT CONTROLLER TESTS ---

    @Test
    @DisplayName("GET /api/v1/reports/revenue - unauthorized for driver")
    @WithMockUser(roles = "DRIVER")
    void testGetRevenueReport_unauthorized() throws Exception {
        mockMvc.perform(get("/reports/revenue"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/reports/revenue - success for manager")
    @WithMockUser(roles = "MANAGER")
    void testGetRevenueReport_success() throws Exception {
        RevenueReportResponse response = RevenueReportResponse.builder()
                .totalRevenue(new BigDecimal("1000.00"))
                .build();

        when(reportService.getRevenueReport(any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/reports/revenue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRevenue").value(1000.00));
    }

    @Test
    @DisplayName("GET /api/v1/reports/occupancy - success for manager")
    @WithMockUser(roles = "MANAGER")
    void testGetOccupancyReport_success() throws Exception {
        OccupancyReportResponse response = OccupancyReportResponse.builder()
                .occupancyRate(85.0)
                .build();

        when(reportService.getOccupancyReport(any())).thenReturn(response);

        mockMvc.perform(get("/reports/occupancy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.occupancyRate").value(85.0));
    }

    @Test
    @DisplayName("GET /api/v1/reports/peak-hours - success for manager")
    @WithMockUser(roles = "MANAGER")
    void testGetPeakHoursReport_success() throws Exception {
        PeakHoursReportResponse response = PeakHoursReportResponse.builder()
                .hourlyArrivals(Collections.emptyList())
                .dailyArrivals(Collections.emptyList())
                .build();

        when(reportService.getPeakHoursReport(any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/reports/peak-hours"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/reports/sessions - success for manager")
    @WithMockUser(roles = "MANAGER")
    void testSearchSessions_success() throws Exception {
        SessionResponse session = SessionResponse.builder()
                .id(UUID.randomUUID())
                .licensePlate("30A-12345")
                .build();

        when(reportService.searchSessions(any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(session)));

        mockMvc.perform(get("/reports/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].licensePlate").value("30A-12345"));
    }

    // --- ADMIN CONTROLLER TESTS ---

    @Test
    @DisplayName("GET /api/v1/admin/users - unauthorized for manager")
    @WithMockUser(roles = "MANAGER")
    void testSearchUsers_unauthorized() throws Exception {
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - success for admin")
    @WithMockUser(roles = "ADMIN")
    void testSearchUsers_success() throws Exception {
        UserResponse user = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .build();

        when(adminService.searchUsers(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(user)));

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].email").value("test@example.com"));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/users/{id}/role - success for admin")
    @WithMockUser(username = "adminuser", roles = "ADMIN")
    void testUpdateUserRole_success() throws Exception {
        UUID userId = UUID.randomUUID();
        UserRoleUpdateRequest request = new UserRoleUpdateRequest();
        request.setRole(UserRole.MANAGER);

        UserResponse response = UserResponse.builder()
                .id(userId)
                .role(UserRole.MANAGER)
                .build();

        when(adminService.updateUserRole(eq(userId), eq(UserRole.MANAGER), eq("adminuser"))).thenReturn(response);

        mockMvc.perform(patch("/admin/users/" + userId + "/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("MANAGER"));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/users/{id}/status - success for admin")
    @WithMockUser(username = "adminuser", roles = "ADMIN")
    void testUpdateUserStatus_success() throws Exception {
        UUID userId = UUID.randomUUID();
        UserStatusUpdateRequest request = new UserStatusUpdateRequest();
        request.setActive(false);

        UserResponse response = UserResponse.builder()
                .id(userId)
                .active(false)
                .build();

        when(adminService.updateUserStatus(eq(userId), eq(false), eq("adminuser"))).thenReturn(response);

        mockMvc.perform(patch("/admin/users/" + userId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/admin/config - success for admin")
    @WithMockUser(roles = "ADMIN")
    void testGetSystemConfig_success() throws Exception {
        AdminConfigResponse response = AdminConfigResponse.builder()
                .totalUsers(10L)
                .build();
        when(adminService.getSystemConfig()).thenReturn(response);

        mockMvc.perform(get("/admin/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(10));
    }

    // --- VNPAY / PAYMENT CONTROLLER TESTS ---

    @Test
    @DisplayName("GET /payments/vnpay/create - success for driver")
    @WithMockUser(roles = "DRIVER")
    void testCreateVNPayPayment_Success() throws Exception {
        UUID sessionId = UUID.randomUUID();
        VNPayResponse response = VNPayResponse.builder()
                .paymentUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?foo=bar")
                .build();

        when(vnpayService.createPayment(eq(sessionId), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/payments/vnpay/create?sessionId=" + sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentUrl").value("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?foo=bar"));
    }

    @Test
    @DisplayName("GET /payments/vnpay/create - unauthorized for anonymous")
    void testCreateVNPayPayment_Unauthorized() throws Exception {
        UUID sessionId = UUID.randomUUID();
        mockMvc.perform(get("/payments/vnpay/create?sessionId=" + sessionId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /payments/vnpay/ipn - success without authentication")
    void testProcessVNPayIpn_Success() throws Exception {
        Map<String, String> result = Map.of("RspCode", "00", "Message", "Confirm success");
        when(vnpayService.processIpn(any())).thenReturn(result);

        mockMvc.perform(get("/payments/vnpay/ipn?vnp_Amount=10000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"))
                .andExpect(jsonPath("$.Message").value("Confirm success"));
    }

    // --- PARKING SESSION CONTROLLER TESTS ---

    @Test
    @DisplayName("PATCH /sessions/{id}/slot - success for driver")
    @WithMockUser(roles = "DRIVER")
    void testAssignSlot_Success() throws Exception {
        UUID sessionId = UUID.randomUUID();
        UUID slotId = UUID.randomUUID();
        SessionResponse response = SessionResponse.builder()
                .id(sessionId)
                .slotId(slotId)
                .slotCode("A-10")
                .build();

        when(parkingSessionService.assignSlot(eq(sessionId), eq(slotId), any())).thenReturn(response);

        mockMvc.perform(patch("/sessions/" + sessionId + "/slot?slotId=" + slotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slotId").value(slotId.toString()))
                .andExpect(jsonPath("$.data.slotCode").value("A-10"));
    }

    @Test
    @DisplayName("PATCH /sessions/{id}/slot - unauthorized for anonymous")
    void testAssignSlot_Unauthorized() throws Exception {
        UUID sessionId = UUID.randomUUID();
        UUID slotId = UUID.randomUUID();

        mockMvc.perform(patch("/sessions/" + sessionId + "/slot?slotId=" + slotId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /sessions/my - success for driver")
    @WithMockUser(roles = "DRIVER", username = "driver@parking.com")
    void testGetMySessions_Success() throws Exception {
        SessionResponse sessionResponse = SessionResponse.builder()
                .id(UUID.randomUUID())
                .licensePlate("30A-12345")
                .ticketCode("TKT-1234")
                .build();

        PageImpl<SessionResponse> page = new PageImpl<>(List.of(sessionResponse));

        when(parkingSessionService.getMySessions(eq("driver@parking.com"), any())).thenReturn(page);

        mockMvc.perform(get("/sessions/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].licensePlate").value("30A-12345"));
    }

    @Test
    @DisplayName("GET /feedback/my - success for driver")
    @WithMockUser(roles = "DRIVER", username = "driver@parking.com")
    void testGetMyFeedback_Success() throws Exception {
        FeedbackResponse feedbackResponse = FeedbackResponse.builder()
                .id(UUID.randomUUID())
                .content("Good service")
                .build();

        PageImpl<FeedbackResponse> page = new PageImpl<>(List.of(feedbackResponse));

        when(feedbackService.getMyFeedback(eq("driver@parking.com"), any())).thenReturn(page);

        mockMvc.perform(get("/feedback/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].content").value("Good service"));
    }

    @Test
    @DisplayName("GET /sessions/my - fail with REFRESH token type")
    void testGetMySessions_WithRefreshToken_Fails() throws Exception {
        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        "driver@parking.com",
                        "password",
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_DRIVER"))
                );
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        mockMvc.perform(get("/sessions/my")
                        .header("Authorization", "Bearer " + refreshToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /auth/refresh - fail with ACCESS token type")
    void testRefreshToken_WithAccessToken_Fails() throws Exception {
        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        "driver@parking.com",
                        "password",
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_DRIVER"))
                );
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        com.parking.dto.auth.RefreshTokenRequest request = new com.parking.dto.auth.RefreshTokenRequest();
        request.setRefreshToken(accessToken);

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
