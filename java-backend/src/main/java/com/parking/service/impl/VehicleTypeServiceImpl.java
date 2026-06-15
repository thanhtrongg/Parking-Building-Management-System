package com.parking.service.impl;

import com.parking.dto.vehicletype.VehicleTypeRequest;
import com.parking.dto.vehicletype.VehicleTypeResponse;
import com.parking.entity.VehicleType;
import com.parking.exception.DuplicateResourceException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.VehicleTypeRepository;
import com.parking.service.VehicleTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleTypeServiceImpl implements VehicleTypeService {

    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VehicleTypeResponse> getAllVehicleTypes(UUID buildingId) {
        List<VehicleType> types = (buildingId != null)
                ? vehicleTypeRepository.findByBuildingId(buildingId)
                : vehicleTypeRepository.findAll();
        return types.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleTypeResponse getVehicleTypeById(UUID id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + id));
        return mapToResponse(vehicleType);
    }

    @Override
    public VehicleTypeResponse createVehicleType(VehicleTypeRequest request) {
        if (vehicleTypeRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Vehicle type already exists with name: " + request.getName());
        }

        VehicleType vehicleType = VehicleType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        vehicleType = vehicleTypeRepository.save(vehicleType);
        return mapToResponse(vehicleType);
    }

    @Override
    public VehicleTypeResponse updateVehicleType(UUID id, VehicleTypeRequest request) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + id));

        if (!vehicleType.getName().equalsIgnoreCase(request.getName()) && 
            vehicleTypeRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Vehicle type already exists with name: " + request.getName());
        }

        vehicleType.setName(request.getName());
        vehicleType.setDescription(request.getDescription());

        vehicleType = vehicleTypeRepository.save(vehicleType);
        return mapToResponse(vehicleType);
    }

    @Override
    public void deleteVehicleType(UUID id) {
        if (!vehicleTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle type not found with id: " + id);
        }
        vehicleTypeRepository.deleteById(id);
    }

    private VehicleTypeResponse mapToResponse(VehicleType vehicleType) {
        return VehicleTypeResponse.builder()
                .id(vehicleType.getId())
                .name(vehicleType.getName())
                .description(vehicleType.getDescription())
                .build();
    }
}
