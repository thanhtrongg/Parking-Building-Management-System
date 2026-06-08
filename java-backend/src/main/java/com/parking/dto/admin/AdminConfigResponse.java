package com.parking.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminConfigResponse {

    private String jvmVersion;
    private String activeProfile;
    private String osName;
    private int availableProcessors;
    private long totalMemoryMb;
    private long freeMemoryMb;
    private long totalBuildings;
    private long totalUsers;
    private long totalActiveSessions;
    private long totalSlots;
}
