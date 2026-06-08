package com.parking.service;

import com.parking.dto.pricing.PricingRequest;
import com.parking.dto.pricing.PricingResponse;

import java.util.List;
import java.util.UUID;

public interface PricingService {

    List<PricingResponse> getPricingByBuilding(UUID buildingId);

    PricingResponse getPricingById(UUID id);

    PricingResponse createPricing(PricingRequest request);

    PricingResponse updatePricing(UUID id, PricingRequest request);

    void deletePricing(UUID id);
}
