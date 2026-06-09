package com.parking.repository;

import com.parking.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, UUID> {

    @Query("SELECT v FROM VehicleType v WHERE v.name = :name OR " +
           "(v.name = 'Ô tô' AND :name = 'CAR') OR " +
           "(v.name = 'Xe máy' AND :name = 'MOTORBIKE') OR " +
           "(v.name = 'Xe đạp' AND :name = 'BICYCLE')")
    Optional<VehicleType> findByName(@Param("name") String name);

    boolean existsByName(String name);
}
