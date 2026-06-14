package com.parking.service.impl;

import com.parking.dto.rule.ParkingRuleRequest;
import com.parking.dto.rule.ParkingRuleResponse;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingRule;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.repository.ParkingRuleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ParkingRuleServiceImplTest {

    @Mock
    private ParkingRuleRepository parkingRuleRepository;

    @Mock
    private ParkingBuildingRepository parkingBuildingRepository;

    @InjectMocks
    private ParkingRuleServiceImpl parkingRuleService;

    @Test
    @DisplayName("Get all rules by building ID")
    void testGetRulesByBuilding_Success() {
        UUID buildingId = UUID.randomUUID();
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        ParkingRule rule = ParkingRule.builder()
                .id(UUID.randomUUID())
                .building(building)
                .title("Title 1")
                .content("Rule 1")
                .displayOrder(1)
                .isActive(true)
                .build();

        when(parkingRuleRepository.findByBuildingIdOrderByDisplayOrderAsc(buildingId))
                .thenReturn(List.of(rule));

        List<ParkingRuleResponse> responses = parkingRuleService.getRulesByBuilding(buildingId);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Title 1", responses.get(0).getTitle());
        assertEquals("Rule 1", responses.get(0).getContent());
        assertEquals("Building A", responses.get(0).getBuildingName());
    }

    @Test
    @DisplayName("Get active rules by building ID")
    void testGetActiveRulesByBuilding_Success() {
        UUID buildingId = UUID.randomUUID();
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        ParkingRule rule = ParkingRule.builder()
                .id(UUID.randomUUID())
                .building(building)
                .title("Active Title")
                .content("Active Rule")
                .displayOrder(1)
                .isActive(true)
                .build();

        when(parkingRuleRepository.findByBuildingIdAndIsActiveTrueOrderByDisplayOrderAsc(buildingId))
                .thenReturn(List.of(rule));

        List<ParkingRuleResponse> responses = parkingRuleService.getActiveRulesByBuilding(buildingId);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Active Title", responses.get(0).getTitle());
        assertEquals("Active Rule", responses.get(0).getContent());
    }

    @Test
    @DisplayName("Get rule by ID - Success")
    void testGetRuleById_Success() {
        UUID ruleId = UUID.randomUUID();
        ParkingBuilding building = ParkingBuilding.builder().id(UUID.randomUUID()).name("Building A").build();
        ParkingRule rule = ParkingRule.builder()
                .id(ruleId)
                .building(building)
                .title("Detail Title")
                .content("Rule Detail")
                .displayOrder(2)
                .isActive(true)
                .build();

        when(parkingRuleRepository.findById(ruleId)).thenReturn(Optional.of(rule));

        ParkingRuleResponse response = parkingRuleService.getRuleById(ruleId);

        assertNotNull(response);
        assertEquals("Detail Title", response.getTitle());
        assertEquals("Rule Detail", response.getContent());
    }

    @Test
    @DisplayName("Get rule by ID - Not Found")
    void testGetRuleById_NotFound() {
        UUID ruleId = UUID.randomUUID();
        when(parkingRuleRepository.findById(ruleId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> parkingRuleService.getRuleById(ruleId));
    }

    @Test
    @DisplayName("Create rule - Success")
    void testCreateRule_Success() {
        UUID buildingId = UUID.randomUUID();
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        ParkingRuleRequest request = ParkingRuleRequest.builder()
                .buildingId(buildingId)
                .title("New Title")
                .content("New Rule")
                .displayOrder(3)
                .isActive(true)
                .build();

        ParkingRule rule = ParkingRule.builder()
                .id(UUID.randomUUID())
                .building(building)
                .title("New Title")
                .content("New Rule")
                .displayOrder(3)
                .isActive(true)
                .build();

        when(parkingBuildingRepository.findById(buildingId)).thenReturn(Optional.of(building));
        when(parkingRuleRepository.save(any(ParkingRule.class))).thenReturn(rule);

        ParkingRuleResponse response = parkingRuleService.createRule(request);

        assertNotNull(response);
        assertEquals("New Title", response.getTitle());
        assertEquals("New Rule", response.getContent());
        assertEquals(3, response.getDisplayOrder());
    }

    @Test
    @DisplayName("Create rule - Building Not Found")
    void testCreateRule_BuildingNotFound() {
        UUID buildingId = UUID.randomUUID();
        ParkingRuleRequest request = ParkingRuleRequest.builder()
                .buildingId(buildingId)
                .title("New Title")
                .content("New Rule")
                .build();

        when(parkingBuildingRepository.findById(buildingId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> parkingRuleService.createRule(request));
    }

    @Test
    @DisplayName("Update rule - Success")
    void testUpdateRule_Success() {
        UUID ruleId = UUID.randomUUID();
        UUID buildingId = UUID.randomUUID();
        ParkingBuilding building = ParkingBuilding.builder().id(buildingId).name("Building A").build();
        ParkingRule rule = ParkingRule.builder()
                .id(ruleId)
                .building(building)
                .title("Old Title")
                .content("Old Rule")
                .displayOrder(1)
                .isActive(true)
                .build();

        ParkingRuleRequest request = ParkingRuleRequest.builder()
                .buildingId(buildingId)
                .title("Updated Title")
                .content("Updated Rule")
                .displayOrder(5)
                .isActive(false)
                .build();

        when(parkingRuleRepository.findById(ruleId)).thenReturn(Optional.of(rule));
        when(parkingBuildingRepository.findById(buildingId)).thenReturn(Optional.of(building));
        when(parkingRuleRepository.save(any(ParkingRule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ParkingRuleResponse response = parkingRuleService.updateRule(ruleId, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Rule", response.getContent());
        assertEquals(5, response.getDisplayOrder());
        assertFalse(response.isActive());
    }

    @Test
    @DisplayName("Delete rule - Success")
    void testDeleteRule_Success() {
        UUID ruleId = UUID.randomUUID();
        when(parkingRuleRepository.existsById(ruleId)).thenReturn(true);
        doNothing().when(parkingRuleRepository).deleteById(ruleId);

        assertDoesNotThrow(() -> parkingRuleService.deleteRule(ruleId));
        verify(parkingRuleRepository, times(1)).deleteById(ruleId);
    }

    @Test
    @DisplayName("Delete rule - Not Found")
    void testDeleteRule_NotFound() {
        UUID ruleId = UUID.randomUUID();
        when(parkingRuleRepository.existsById(ruleId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> parkingRuleService.deleteRule(ruleId));
        verify(parkingRuleRepository, never()).deleteById(any(UUID.class));
    }
}
