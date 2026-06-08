package com.parking.service.impl;

import com.parking.entity.AuditLog;
import com.parking.repository.AuditLogRepository;
import com.parking.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Async
    public void log(String actorEmail, String action, String entityType, UUID entityId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actorEmail(actorEmail)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Audit logging should never break business logic
            log.error("Failed to persist audit log: action={}, entity={}, id={}", action, entityType, entityId, e);
        }
    }
}
