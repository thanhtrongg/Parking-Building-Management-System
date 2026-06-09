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
        vehicleTypeRepository.save(VehicleType.builder().name("Ô tô").description("Xe ô tô").build());
        vehicleTypeRepository.save(VehicleType.builder().name("Xe máy").description("Xe máy").build());
        vehicleTypeRepository.save(VehicleType.builder().name("Xe đạp").description("Xe đạp").build());
        vehicleTypeRepository.save(VehicleType.builder().name("Xe điện").description("Xe điện").build());
        vehicleTypeRepository.save(VehicleType.builder().name("Xe tải nhỏ").description("Xe tải nhỏ").build());
    }

    @Test
    @DisplayName("Should retrieve 'Ô tô' when searching for 'CAR'")
    void testFindByNameCar() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("CAR");
        assertTrue(result.isPresent());
        assertEquals("Ô tô", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve 'Xe máy' when searching for 'MOTORBIKE'")
    void testFindByNameMotorbike() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("MOTORBIKE");
        assertTrue(result.isPresent());
        assertEquals("Xe máy", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve 'Xe đạp' when searching for 'BICYCLE'")
    void testFindByNameBicycle() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("BICYCLE");
        assertTrue(result.isPresent());
        assertEquals("Xe đạp", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve 'Ô tô' when searching for 'Ô tô'")
    void testFindByNameVietnameseCar() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("Ô tô");
        assertTrue(result.isPresent());
        assertEquals("Ô tô", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve 'Xe máy' when searching for 'Xe máy'")
    void testFindByNameVietnameseMotorbike() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("Xe máy");
        assertTrue(result.isPresent());
        assertEquals("Xe máy", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve 'Xe đạp' when searching for 'Xe đạp'")
    void testFindByNameVietnameseBicycle() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("Xe đạp");
        assertTrue(result.isPresent());
        assertEquals("Xe đạp", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve 'Xe điện' when searching for 'Xe điện'")
    void testFindByNameElectric() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("Xe điện");
        assertTrue(result.isPresent());
        assertEquals("Xe điện", result.get().getName());
    }

    @Test
    @DisplayName("Should retrieve 'Xe tải nhỏ' when searching for 'Xe tải nhỏ'")
    void testFindByNameTruck() {
        Optional<VehicleType> result = vehicleTypeRepository.findByName("Xe tải nhỏ");
        assertTrue(result.isPresent());
        assertEquals("Xe tải nhỏ", result.get().getName());
    }
}
