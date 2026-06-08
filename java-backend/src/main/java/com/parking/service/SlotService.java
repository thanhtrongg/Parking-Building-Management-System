package com.parking.service;

import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface SlotService {

    List<SlotResponse> getSlotsByFloor(UUID floorId);

    List<SlotResponse> getAvailableSlotsByFloor(UUID floorId);

    SlotResponse updateSlotStatus(UUID id, SlotStatusUpdateRequest request);

    SlotRecommendResponse recommendSlot(SlotRecommendRequest request);
}
