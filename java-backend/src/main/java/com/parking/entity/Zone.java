package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "zone_name", nullable = false)
    private String zoneName;

    @Column(name = "vehicle_type_id")
    private UUID vehicleTypeId;

    @Column(name = "total_capacity", nullable = false)
    private int totalCapacity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private ParkingBuilding building;
}
