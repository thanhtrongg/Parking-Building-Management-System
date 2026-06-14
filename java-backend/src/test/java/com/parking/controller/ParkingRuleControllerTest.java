package com.parking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dto.rule.ParkingRuleRequest;
import com.parking.dto.rule.ParkingRuleResponse;
import com.parking.service.ParkingRuleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ParkingRuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ParkingRuleService parkingRuleService;

    @Test
    @DisplayName("GET /rules/building/{id} - success for anonymous guest")
    void testGetRulesByBuilding_PublicSuccess() throws Exception {
        UUID buildingId = UUID.randomUUID();
        ParkingRuleResponse rule = ParkingRuleResponse.builder()
                .id(UUID.randomUUID())
                .buildingId(buildingId)
                .buildingName("Building A")
                .title("Public Title")
                .content("Public Rule")
                .displayOrder(1)
                .isActive(true)
                .build();

        when(parkingRuleService.getRulesByBuilding(buildingId)).thenReturn(List.of(rule));

        mockMvc.perform(get("/rules/building/" + buildingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Public Title"))
                .andExpect(jsonPath("$.data[0].content").value("Public Rule"));
    }

    @Test
    @DisplayName("GET /rules/building/{id}/active - success for anonymous guest")
    void testGetActiveRulesByBuilding_PublicSuccess() throws Exception {
        UUID buildingId = UUID.randomUUID();
        ParkingRuleResponse rule = ParkingRuleResponse.builder()
                .id(UUID.randomUUID())
                .buildingId(buildingId)
                .buildingName("Building A")
                .title("Active Title")
                .content("Active Public Rule")
                .displayOrder(1)
                .isActive(true)
                .build();

        when(parkingRuleService.getActiveRulesByBuilding(buildingId)).thenReturn(List.of(rule));

        mockMvc.perform(get("/rules/building/" + buildingId + "/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Active Title"))
                .andExpect(jsonPath("$.data[0].content").value("Active Public Rule"));
    }

    @Test
    @DisplayName("POST /rules - fail for anonymous guest")
    void testCreateRule_AnonymousFails() throws Exception {
        ParkingRuleRequest request = ParkingRuleRequest.builder()
                .buildingId(UUID.randomUUID())
                .title("Title")
                .content("Rule Content")
                .build();

        mockMvc.perform(post("/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /rules - success for manager")
    @WithMockUser(roles = "MANAGER")
    void testCreateRule_ManagerSuccess() throws Exception {
        UUID buildingId = UUID.randomUUID();
        ParkingRuleRequest request = ParkingRuleRequest.builder()
                .buildingId(buildingId)
                .title("Manager Title")
                .content("Manager Rule")
                .displayOrder(1)
                .isActive(true)
                .build();

        ParkingRuleResponse response = ParkingRuleResponse.builder()
                .id(UUID.randomUUID())
                .buildingId(buildingId)
                .title("Manager Title")
                .content("Manager Rule")
                .displayOrder(1)
                .isActive(true)
                .build();

        when(parkingRuleService.createRule(any(ParkingRuleRequest.class))).thenReturn(response);

        mockMvc.perform(post("/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Manager Title"))
                .andExpect(jsonPath("$.data.content").value("Manager Rule"));
    }

    @Test
    @DisplayName("PUT /rules/{id} - success for admin")
    @WithMockUser(roles = "ADMIN")
    void testUpdateRule_AdminSuccess() throws Exception {
        UUID ruleId = UUID.randomUUID();
        UUID buildingId = UUID.randomUUID();
        ParkingRuleRequest request = ParkingRuleRequest.builder()
                .buildingId(buildingId)
                .title("Admin Title Updated")
                .content("Admin Rule Updated")
                .displayOrder(1)
                .isActive(true)
                .build();

        ParkingRuleResponse response = ParkingRuleResponse.builder()
                .id(ruleId)
                .buildingId(buildingId)
                .title("Admin Title Updated")
                .content("Admin Rule Updated")
                .displayOrder(1)
                .isActive(true)
                .build();

        when(parkingRuleService.updateRule(eq(ruleId), any(ParkingRuleRequest.class))).thenReturn(response);

        mockMvc.perform(put("/rules/" + ruleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Admin Title Updated"))
                .andExpect(jsonPath("$.data.content").value("Admin Rule Updated"));
    }

    @Test
    @DisplayName("DELETE /rules/{id} - success for manager")
    @WithMockUser(roles = "MANAGER")
    void testDeleteRule_ManagerSuccess() throws Exception {
        UUID ruleId = UUID.randomUUID();
        doNothing().when(parkingRuleService).deleteRule(ruleId);

        mockMvc.perform(delete("/rules/" + ruleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Rule deleted successfully"));
    }
}
