---
name: springboot-tdd
description: Spring Boot test-driven development (TDD) cycle, mocking patterns using JUnit 5 and Mockito, MockMvc integration testing, and verification.
---

# Spring Boot Test-Driven Development (TDD)

Guidelines for applying TDD in Spring Boot applications, covering isolated unit tests and endpoint integration tests.

## When to Activate
- Implementing new features, controllers, or service logic
- Resolving compiler errors or regressions in existing code
- Writing mock-based test cases for business logic verification
- Verifying Spring Security access rules via API integration tests

---

## Mockito Unit Testing (Service Layer)

Test service behavior in isolation without loading the full Spring application context:
- Use `@ExtendWith(MockitoExtension.class)` to initialize Mockito.
- Inject mocks using `@Mock` and `@InjectMocks`.
- Use `ReflectionTestUtils` to inject private values (e.g. `@Value` configuration parameters).

```java
@ExtendWith(MockitoExtension.class)
class VNPayServiceImplTest {

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private ParkingSessionService sessionService;

    @InjectMocks
    private VNPayServiceImpl vnpayService;

    @BeforeEach
    void setUp() {
        // Mock properties configured via @Value
        ReflectionTestUtils.setField(vnpayService, "tmnCode", "TEST_TMN");
        ReflectionTestUtils.setField(vnpayService, "hashSecret", "TEST_SECRET");
    }

    @Test
    void testCreatePayment_Success() {
        UUID sessionId = UUID.randomUUID();
        ParkingSession session = ParkingSession.builder().id(sessionId).status(SessionStatus.ACTIVE).build();
        
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionService.calculateSessionFee(eq(sessionId), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("50000"));

        VNPayResponse response = vnpayService.createPayment(sessionId, "127.0.0.1");

        assertNotNull(response);
        assertTrue(response.getPaymentUrl().contains("vnp_Amount=5000000"));
    }
}
```

---

## MockMvc Integration Testing (Controller & Security)

Validate controller endpoint bindings, role checks, serialization, and status codes using `MockMvc`:
- Use `@SpringBootTest` with `@AutoConfigureMockMvc` and `@ActiveProfiles("test")`.
- Mock external service dependencies using `@MockitoBean` (or `@MockBean` in older Boot versions).
- Assert security policies with `@WithMockUser`.

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ControllerE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VNPayService vnpayService;

    @Test
    @DisplayName("GET /payments/vnpay/create - success for driver")
    @WithMockUser(roles = "DRIVER")
    void testCreateVNPayPayment_Success() throws Exception {
        UUID sessionId = UUID.randomUUID();
        VNPayResponse response = VNPayResponse.builder().paymentUrl("https://test.pay.url").build();

        when(vnpayService.createPayment(eq(sessionId), any())).thenReturn(response);

        mockMvc.perform(get("/payments/vnpay/create?sessionId=" + sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentUrl").value("https://test.pay.url"));
    }

    @Test
    @DisplayName("GET /payments/vnpay/ipn - success without authentication")
    void testProcessVNPayIpn_Success() throws Exception {
        Map<String, String> result = Map.of("RspCode", "00", "Message", "Confirm success");
        when(vnpayService.processIpn(any())).thenReturn(result);

        mockMvc.perform(get("/payments/vnpay/ipn?vnp_Amount=10000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"));
    }
}
```
