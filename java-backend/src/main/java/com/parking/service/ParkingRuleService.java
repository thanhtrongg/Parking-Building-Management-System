package com.parking.service;

import com.parking.dto.rule.ParkingRuleRequest;
import com.parking.dto.rule.ParkingRuleResponse;

import java.util.List;
import java.util.UUID;

public interface ParkingRuleService {

    List<ParkingRuleResponse> getRulesByBuilding(UUID buildingId);

    List<ParkingRuleResponse> getActiveRulesByBuilding(UUID buildingId);

    ParkingRuleResponse getRuleById(UUID id);

    ParkingRuleResponse createRule(ParkingRuleRequest request);

    ParkingRuleResponse updateRule(UUID id, ParkingRuleRequest request);

    void deleteRule(UUID id);
}
