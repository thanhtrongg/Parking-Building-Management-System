package com.parking.service;

import java.util.UUID;

/**
 * Async audit logging service for tracking system changes.
 */
public interface AuditService {

    /**
     * Log an auditable action asynchronously.
     *
     * @param actorEmail email of the user performing the action
     * @param action     description of the action (e.g., "ROLE_CHANGE", "CHECK_IN")
     * @param entityType type of entity affected (e.g., "User", "ParkingSession")
     * @param entityId   ID of the affected entity
     * @param details    additional details (JSON or plain text)
     */
    void log(String actorEmail, String action, String entityType, UUID entityId, String details);
}
