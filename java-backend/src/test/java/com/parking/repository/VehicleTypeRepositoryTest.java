package com.parking.repository;

import com.parking.entity.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class VehicleTypeRepositoryTest {

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    @BeforeEach
    void setUp() {
        vehicleTypeRepository.deleteAll();

        // Seed data for repository test
        vehicleTypeRepository.save(VehicleType.builder().name("CAR").description("Private car").build());
        vehicleTypeRepository.save(VehicleType.builder().name("MOTORBIKE").description("Motorbike").build());
        vehicleTypeRepository.save(VehicleType.builder().name("BICYCLE").description("Bicycle").build());
        vehicleTypeRepository.save(VehicleType.builder().name("ELECTRIC_VEHICLE").description("Electric vehicle").build());
        vehicleTypeRepository.save(VehicleType.builder().name("LIGHT_TRUCK").description("Light truck").build());
    }

    @Test
    @DisplayName("Should retrieve CAR when searching for 'CAR'")
    void testFindByNameCar() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("CAR");
        assertTrue(result.isPresent());
        assertEquals("CAR", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve MOTORBIKE when searching for 'MOTORBIKE'")
    void testFindByNameMotorbike() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("MOTORBIKE");
        assertTrue(result.isPresent());
        assertEquals("MOTORBIKE", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve BICYCLE when searching for 'BICYCLE'")
    void testFindByNameBicycle() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("BICYCLE");
        assertTrue(result.isPresent());
        assertEquals("BICYCLE", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve ELECTRIC_VEHICLE when searching for 'ELECTRIC_VEHICLE'")
    void testFindByNameElectric() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("ELECTRIC_VEHICLE");
        assertTrue(result.isPresent());
        assertEquals("ELECTRIC_VEHICLE", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve LIGHT_TRUCK when searching for 'LIGHT_TRUCK'")
    void testFindByNameTruck() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("LIGHT_TRUCK");
        assertTrue(result.isPresent());
        assertEquals("LIGHT_TRUCK", result.get().getName());
    }
}
