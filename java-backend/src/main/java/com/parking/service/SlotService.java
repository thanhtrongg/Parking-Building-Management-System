package com.parking.service;

import com.parking.dto.slot.SlotRecommendRequest;
import com.parking.dto.slot.SlotRecommendResponse;
import com.parking.dto.slot.SlotRequest;
import com.parking.dto.slot.SlotResponse;
import com.parking.dto.slot.SlotStatusUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface SlotService {

    List<SlotResponse> getSlotsByFloor(UUID floorId);

    List<SlotResponse> getAvailableSlotsByFloor(UUID floorId);

    List<SlotResponse> getAllSlots(UUID buildingId);

    SlotResponse updateSlotStatus(UUID id, SlotStatusUpdateRequest request);

    SlotRecommendResponse recommendSlot(SlotRecommendRequest request);

    SlotResponse createSlot(SlotRequest request);

    SlotResponse getSlotById(UUID id);

    SlotResponse updateSlot(UUID id, SlotRequest request);

    void deleteSlot(UUID id);
}
