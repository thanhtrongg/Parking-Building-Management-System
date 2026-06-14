package com.parking.service.impl;

import com.parking.dto.rule.ParkingRuleRequest;
import com.parking.dto.rule.ParkingRuleResponse;
import com.parking.entity.ParkingBuilding;
import com.parking.entity.ParkingRule;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingBuildingRepository;
import com.parking.repository.ParkingRuleRepository;
import com.parking.service.ParkingRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ParkingRuleServiceImpl implements ParkingRuleService {

    private final ParkingRuleRepository parkingRuleRepository;
    private final ParkingBuildingRepository parkingBuildingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ParkingRuleResponse> getRulesByBuilding(UUID buildingId) {
        return parkingRuleRepository.findByBuildingIdOrderByDisplayOrderAsc(buildingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingRuleResponse> getActiveRulesByBuilding(UUID buildingId) {
        return parkingRuleRepository.findByBuildingIdAndIsActiveTrueOrderByDisplayOrderAsc(buildingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingRuleResponse getRuleById(UUID id) {
        ParkingRule rule = parkingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking rule not found with id: " + id));
        return mapToResponse(rule);
    }

    @Override
    public ParkingRuleResponse createRule(ParkingRuleRequest request) {
        ParkingBuilding building = parkingBuildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        ParkingRule rule = ParkingRule.builder()
                .building(building)
                .title(request.getTitle())
                .content(request.getContent())
                .displayOrder(request.getDisplayOrder())
                .isActive(request.isActive())
                .build();

        rule = parkingRuleRepository.save(rule);
        return mapToResponse(rule);
    }

    @Override
    public ParkingRuleResponse updateRule(UUID id, ParkingRuleRequest request) {
        ParkingRule rule = parkingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking rule not found with id: " + id));

        ParkingBuilding building = parkingBuildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        rule.setBuilding(building);
        rule.setTitle(request.getTitle());
        rule.setContent(request.getContent());
        rule.setDisplayOrder(request.getDisplayOrder());
        rule.setActive(request.isActive());

        rule = parkingRuleRepository.save(rule);
        return mapToResponse(rule);
    }

    @Override
    public void deleteRule(UUID id) {
        if (!parkingRuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Parking rule not found with id: " + id);
        }
        parkingRuleRepository.deleteById(id);
    }

    private ParkingRuleResponse mapToResponse(ParkingRule rule) {
        return ParkingRuleResponse.builder()
                .id(rule.getId())
                .buildingId(rule.getBuilding().getId())
                .buildingName(rule.getBuilding().getName())
                .title(rule.getTitle())
                .content(rule.getContent())
                .displayOrder(rule.getDisplayOrder())
                .isActive(rule.isActive())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }
}
