# Parking Building Management System (Backend)

## 📌 Project Overview
* **Topic:** Hệ thống quản lý tòa nhà gửi xe (Parking Building Management System)
* **Context:** Tại các đô thị lớn, nhu cầu gửi xe tăng cao trong khi diện tích đỗ xe bị giới hạn. Tòa nhà gửi xe nhiều tầng là công trình chuyên dùng để tiếp nhận, lưu giữ và tổ chức xe ra/vào theo nhiều tầng hoặc khu vực đỗ khác nhau. Vì lưu lượng xe ra vào liên tục, cần có hệ thống phần mềm hỗ trợ quản lý vận hành bãi xe chính xác và hiệu quả.
* **Problems:** Nghiệp vụ tòa nhà gửi xe cần quản lý tốt các vấn đề như xe vào/ra, chỗ đỗ còn trống, vé gửi xe, phí gửi xe và các tình huống phát sinh như mất vé, quá hạn hoặc sai thông tin xe. Nếu quản lý thủ công, bãi xe dễ bị ùn ứ tại cổng, sai lệch dữ liệu, khó kiểm soát sức chứa và khó đối soát doanh thu.

## 👥 Primary Actors & Functional Requirements

### Primary Actors
* **Parking Facility Manager**
* **Parking Staff**
* **Parking User / Driver**
* **System Administrator**

### Functional Requirements
#### 1. Parking Manager
* Quản lý thông tin tòa nhà gửi xe.
* Quản lý loại phương tiện.
* Quản lý phân tầng theo loại xe.
* Quản lý slot đỗ xe và trạng thái slot (theo dõi slot còn trống, đang sử dụng, đã đặt trước, bảo trì hoặc tạm khóa).
* Quản lý bảng giá, quy định chính sách tính phí gửi xe.
* Xem báo cáo lượt xe vào/ra, doanh thu, tỷ lệ lấp đầy, khung giờ cao điểm theo từng loại phương tiện.
* Các quản lý nâng cao khác như: theo dõi các trường hợp mất vé, sai biển số, quá giờ, gửi sai khu vực, xe chưa thanh toán (optional).

#### 2. Parking Staff
* Hỗ trợ xử lý xe vào bãi: kiểm tra điều kiện xe vào bãi, nhập/quét biển số xe, hướng dẫn xe vào đúng tầng/khu vực theo loại phương tiện.
* Tạo lượt gửi xe: Tạo parking session cho xe gửi theo lượt, ghi nhận thời gian vào, loại xe, cổng vào.
* Hỗ trợ xử lý xe ra bãi: tìm lượt gửi xe, xác nhận thời gian ra, kiểm tra phí cần thanh toán, thu phí gửi xe.
* Hỗ trợ xử lý các trường hợp ngoại lệ: mất thẻ xe, sai thông tin xe, xe quá hạn gửi, xe gửi sai khu vực, cập nhật trạng thái slot.

#### 3. Parking User / Driver
* Xem thông tin bãi xe: thời gian hoạt động, loại xe được phục vụ, bảng giá và quy định gửi xe, số slot trống.
* Gửi xe theo lượt: nhận thẻ xe/mã gửi xe khi vào bãi và thanh toán phí khi ra.
* Đặt chỗ trước: đặt chỗ theo loại phương tiện, thời gian gửi và khu vực còn trống nếu hệ thống hỗ trợ.
* Theo dõi lượt gửi xe: xem thông tin lượt gửi xe hiện tại: giờ vào, loại xe, khu vực gửi, phí tạm tính.
* Thanh toán phí gửi xe và dịch vụ bổ sung nếu có.
* Gửi phản hồi về mất thẻ xe, sai phí, khó tìm xe, slot bị chiếm hoặc vấn đề trong bãi xe (optional).

#### 4. System Administrator
* Quản lý tài khoản người dùng.
* Phân quyền.
* Quản lý cấu hình hệ thống.

***Khuyến khích có thêm các chức năng AI hỗ trợ như:** Tối ưu phân bổ chỗ đỗ xe theo loại phương tiện trong tòa nhà gửi xe sao cho giảm thời gian tìm chỗ, tăng tỷ lệ sử dụng bãi xe.*

## 🔬 Research & Analysis
* **RBL Topic:** Yes
* **Research Questions:**
  * **RQ1:** Việc phân tầng, khu vực theo loại phương tiện ảnh hưởng thế nào đến hiệu quả sử dụng chỗ đỗ?
  * **RQ2:** Phân bổ slot tự động có giúp giảm thời gian tìm chỗ so với cách chọn chỗ tự do không?
  * **RQ3:** Nên ưu tiên tiêu chí nào khi phân bổ slot: khoảng cách, tầng, loại xe, thời gian gửi hay tỷ lệ lấp đầy slot đỗ các tầng, các khu vực?
  * **RQ4:** Thuật toán phân bổ slot có thể cải thiện tỷ lệ sử dụng bãi xe trong giờ cao điểm?

---

## 🚀 Getting Started & Docker Compose Configuration

The backend application is configured to run inside containerized environments using Docker Compose, linking a Spring Boot 3.4 API service with a PostgreSQL database.

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

### Docker Compose Services
The `docker-compose.yml` configures two primary services:
1. **`db` (PostgreSQL Database):**
   - **Image:** `postgres:16-alpine` (lightweight, secure PostgreSQL image)
   - **Default Port:** `5432` mapped to host `5432` (configurable via `DB_PORT`)
   - **Healthcheck:** Checks database readiness via `pg_isready` command:
     ```yaml
     healthcheck:
       test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-parking} -d parking_db"]
       interval: 10s
       timeout: 5s
       retries: 5
     ```
2. **`app` (Spring Boot API):**
   - **Build Source:** Local `Dockerfile` using a secure multi-stage JVM JRE container.
   - **Default Port:** `8080` mapped to host `8080` (configurable via `APP_PORT`)
   - **Healthcheck:** Verifies backend health via API docs endpoint:
     ```yaml
     healthcheck:
       test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/api/v1/api-docs"]
       interval: 30s
       timeout: 10s
       retries: 3
       start_period: 30s
     ```

### Environment Variables
You can configure behavior by creating a local `.env` file or exporting environment variables:

| Variable Name | Description | Default / Fallback |
|---|---|---|
| `DB_PORT` | Host port mapped to PostgreSQL | `5432` |
| `DB_USER` | Database username | `parking` |
| `DB_PASSWORD` | Database password | `parking123` |
| `APP_PORT` | Host port mapped to Spring Boot backend | `8080` |
| `JWT_SECRET` | 256-bit secret key used for signing JWT tokens | `defaultDevSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm` |
| `VNPAY_TMN_CODE` | VNPay merchant terminal code | `2QRY7YW8` (Sandbox Code) |
| `VNPAY_HASH_SECRET` | VNPay merchant secure hash key | `GETJDYUXQLNYMXRZZDTVWJKEYXOTXTMI` |
| `VNPAY_PAY_URL` | VNPay sandbox payment gateway gateway URL | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `VNPAY_RETURN_URL`| Frontend URL to redirect user after payment | `http://localhost:5173/payment-callback` |
| `RATE_LIMIT_MAX` | Max allowed requests per client IP inside window | `30` |
| `RATE_LIMIT_WINDOW`| Sliding window duration in seconds | `60` |

### Running the System
To build and start both the Spring Boot app and Postgres database in the background:
```bash
docker compose up -d --build
```
To view logs:
```bash
docker compose logs -f app
```
To stop the services:
```bash
docker compose down
```
To stop the services and reset database volumes (wiping the database to allow fresh seeding):
```bash
docker compose down -v
```

---

## ✨ Newly Implemented Features

### 1. Flexible Reservations
Drivers can create two types of slot reservations:
* **Specific Slot Reservation:** Reserves a specific slot (`slotId` provided). The system ensures that the slot is in the requested building, matches the vehicle type, and has no overlapping `PENDING` or `CONFIRMED` reservations.
* **Flexible Reservation:** Reserves general capacity in a building for a specific vehicle type without choosing a slot up front (`slotId` is null). The system calculates the building's overall slot capacity for that vehicle type and checks if the count of overlapping active reservations exceeds it. If capacity is available, the reservation is confirmed.

*An active background scheduler (`ReservationScheduler`) runs every 60 seconds to automatically expire stale reservations that pass their `reserved_to` time without a driver checking in, releasing the reserved slots back to `AVAILABLE`.*

### 2. Rate Limit Filter Configuration
* **Implementation:** `RateLimitFilter` is an in-memory sliding-window rate limiter per client IP address.
* **Scope:** Applied specifically to authentication endpoints (`/auth/**`) and VNPay IPN callbacks (`/payments/vnpay/ipn`) to protect the system against brute-force attacks and webhook spamming.
* **Configuration:** Configured via `app.rate-limit.max-requests` (mapped to `RATE_LIMIT_MAX`) and `app.rate-limit.window-seconds` (mapped to `RATE_LIMIT_WINDOW`).
* **Behavior:** Returns `429 Too Many Requests` with a `Retry-After` header when the limit is exceeded.

### 3. JWT Token Type Validation
To prevent security misconfigurations where a long-lived Refresh Token could be maliciously used as an Access Token to call endpoints:
* **Claim:** Every generated JWT contains a custom `"type"` claim (`"ACCESS"` or `"REFRESH"`).
* **Validation:** The `JwtAuthFilter` strictly checks if the token has the `"ACCESS"` type claim before authenticating. Any Refresh Token sent to regular secure API endpoints is rejected.

### 4. Driver-Facing Pagination Endpoints
Pagination has been integrated to optimize mobile/driver queries and reduce server-side memory footprint:
* **My Sessions (`GET /sessions/my`):** Retrieves paginated parking sessions of the authenticated driver. Supports standard pagination parameters (`page`, `size`, `sort`). Defaults to 10 items per page sorted by `checkInTime` (DESC).
* **My Feedback (`GET /feedbacks/my`):** Retrieves paginated feedback submissions by the driver. Defaults to 10 items per page sorted by `createdAt` (DESC).

### 5. VNPay Integration
* **API Endpoints:**
  * `GET /payments/vnpay/create?sessionId=<UUID>`: Generates a secure redirect URL pointing to the VNPay Sandbox Payment Gateway. The system automatically fetches the user's IP, role, and temporary/lost-ticket fees, converting the VND amount to the format expected by VNPay (multiplied by 100).
  * `GET /payments/vnpay/ipn`: Safe Instant Payment Notification callback used by VNPay to notify payment completion. Validates hash security and locks payment transaction upon success.
* **Flyway Migration:** `V3__add_vnpay_payment_method.sql` updates the database constraint check to support the `VNPAY` method beside `CASH`, `TRANSFER`, and `EWALLET`.

---

## 🧪 Compiling and Running Tests

The test suite contains **76 unit & integration tests** covering controllers, services, repositories, security, and payment integrations.

### Running Tests Locally
If you have the Apache Maven Daemon (`mvnd`) installed (recommended for fast parallel execution):
```bash
mvnd test
```

If you are using standard Apache Maven (`mvn`):
```bash
mvn test
```

### Packaging & Compilation
To compile the classes and package the application into a runnable `.jar` file without running tests:
```bash
mvn clean package -DskipTests
# or
mvnd clean package -DskipTests
```
