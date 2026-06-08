---
name: springboot-patterns
description: Java Spring Boot clean architecture patterns, Controller-Service-Repository-DTO structure, transactional management, JPA performance, and error handling.
---

# Spring Boot Development Patterns

Guidelines and patterns for structuring Java Spring Boot applications cleanly and efficiently.

## When to Activate
- Designing REST controllers and request mapping
- Implementing service logic, business boundaries, or transaction units
- Querying databases using Spring Data JPA
- Designing data transfer objects (DTOs) and entity mappers
- Formatting global exceptions and API envelopes

## Clean Layered Architecture

Always separate concerns clearly across the classic layers:

1. **Controller Layer**: Handles HTTP mapping, role checks, input validation, and returns DTOs wrapped in an `ApiResponse`.
2. **Service Layer**: Coordinates business processes and transactions. Does not interact directly with HTTP request details.
3. **Repository Layer**: Extends Spring Data JPA repository interfaces for database access.
4. **DTO Layer**: Decouples presentation objects from database entities.

### Constructor Dependency Injection
Avoid field-level `@Autowired` (a known code smell). Use constructor injection, easily generated via Lombok:

```java
// PASS: Constructor injection via Lombok
@Service
@RequiredArgsConstructor
public class ParkingSlotServiceImpl implements SlotService {
    private final ParkingSlotRepository slotRepository;
    private final FloorRepository floorRepository;
    // final fields are injected automatically
}
```

---

## Database & JPA Patterns

### Transaction Demarcation
- Place `@Transactional` at the Service implementation layer.
- Annotate read-only methods with `@Transactional(readOnly = true)` to optimize Hibernate performance.

```java
@Service
@RequiredArgsConstructor
@Transactional
public class PricingServiceImpl implements PricingService {

    private final PricingRepository pricingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PricingResponse> getAllPricing() {
        return pricingRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PricingResponse createPricing(PricingRequest request) {
        Pricing pricing = convertToEntity(request);
        Pricing saved = pricingRepository.save(pricing);
        return convertToDto(saved);
    }
}
```

### Preventing N+1 Queries
Use `JOIN FETCH` in JPA queries to load lazily-loaded relationships in a single SQL operation.

```java
// PASS: Left join fetch avoids N+1 query problem
@Query("SELECT s FROM ParkingSession s " +
       "LEFT JOIN FETCH s.slot " +
       "LEFT JOIN FETCH s.driver " +
       "WHERE s.status = :status")
List<ParkingSession> findAllByStatusWithRelations(@Param("status") SessionStatus status);
```

### Paginated Results
Always paginate collections returned from search/listing endpoints using `Pageable` and `Page<T>`.

```java
@GetMapping("/users")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    
    Pageable pageable = PageRequest.of(page, size);
    Page<UserResponse> response = adminService.searchUsers(keyword, pageable);
    return ResponseEntity.ok(ApiResponse.success("Users retrieved", response));
}
```

---

## Exception Handling

Implement centralized exception handler mapping using `@RestControllerAdvice` and `@ExceptionHandler`.

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Unhandled exception: ", ex);
        // Mask inner stack details from user responses
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred"));
    }
}
```
