# Frontend Integration Guide

This guide is designed to help frontend developers connect their application (e.g., React/Vite, Next.js, Vue) to the Spring Boot backend.

---

## 🚀 1. Local Development Setup

To run the backend locally, you do **not** need to install Java, Maven, or PostgreSQL. Everything is containerized with Docker Compose.

### Step 1: Start the services
Run the following command in the `java-backend/` root directory to start the services:
```bash
docker compose up -d
```

> [!NOTE]
> If you have updated or modified the backend source code and need to rebuild the Spring Boot application jar inside the container, run:
> ```bash
> docker compose up -d --build
> ```

> [!IMPORTANT]
> To reset the database state and force a clean run of the database seeder (repopulating with clean English mock data), stop the services and wipe database volumes:
> ```bash
> docker compose down -v
> docker compose up -d --build
> ```

### Step 2: Verify health status
Check that both containers are running and reported as healthy:
```bash
docker compose ps
```

---

## 📖 2. API Documentation & Swagger Dashboard

The backend exposes an interactive **Swagger UI** containing all endpoints, request/response models, and status codes.

- **Swagger UI Dashboard**: [http://localhost:8080/api/v1/swagger-ui/index.html](http://localhost:8080/api/v1/swagger-ui/index.html)
- **Raw OpenAPI JSON Spec**: [http://localhost:8080/api/v1/api-docs](http://localhost:8080/api/v1/api-docs)

> [!TIP]
> You can import the **Raw OpenAPI JSON Spec** directly into **Postman** or **Insomnia** to instantly generate an API collection for manual testing.
>
> Alternatively, you can use the pre-configured [api_tests.http](file:///home/duu/FPT/Parking-Building-Management-System/java-backend/api_tests.http) file in the project root to run requests directly from IntelliJ or VS Code (using the REST Client extension). It is fully mapped to the seeded development mock data.

---

## 🔀 3. CORS & Base URL Configuration

By default, the backend allows CORS requests from `http://localhost:5173` (Vite's default port). 

### Customizing Allowed Origins
If your frontend runs on a different port (e.g., Next.js on `http://localhost:3000`), configure it in `docker-compose.yml` under the `app` service's environment properties:
```yaml
environment:
  - app.cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

---

## 🔐 4. Authentication Flow (JWT & Refresh Token)

All authenticated endpoints require a Bearer Token in the `Authorization` header.

### Endpoints
1. **Login**: `POST /auth/login`
   - **Request**: `{ "email": "driver@parking.com", "password": "password" }`
   - **Response**: Returns `accessToken` (expires in 24h) and `refreshToken` (expires in 7 days).
2. **Token Refresh**: `POST /auth/refresh`
   - **Request**: `{ "refreshToken": "YOUR_REFRESH_TOKEN" }`
   - **Header**: Must include type claim verification (handled automatically by sending the token).
   - **Response**: Returns a new `accessToken` and `refreshToken`.

---

## 🛠️ 5. Auto-Generating Frontend API SDK (TypeScript)

Instead of writing types and fetch functions manually, you can automatically generate a full TypeScript SDK matching the backend's models using `openapi-generator-cli`.

### Generation Steps
Run this command in your frontend project directory to generate the API client:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/api/v1/api-docs \
  -g typescript-axios \
  -o ./src/api-client
```

This will automatically create TS interfaces matching the backend's entities (e.g., `SessionResponse`, `ReservationRequest`, `VNPayResponse`) and ready-to-use Axios request methods.

---

## ⚡ 6. Sample Axios Interceptor Configuration

Here is a recommended template for setting up Axios in your frontend to handle automatic JWT headers, token refreshing, and server error parsing.

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables sending cookie details if required
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Auto Refresh JWT on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If access token is expired, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshResponse = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed -> Log out user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 💳 7. VNPay Payment Flow Integration
To integrate VNPay payments:
1. Call `POST /payments/vnpay/create?sessionId=...` from the driver frontend.
2. The endpoint returns a JSON payload containing the `paymentUrl`:
   ```json
   {
     "success": true,
     "message": "Payment url generated successfully",
     "data": {
       "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
     }
   }
   ```
3. Redirect the driver's browser to the `paymentUrl`.
4. After completing the payment, VNPay will redirect back to the `return-url` configured in your frontend:
   `http://localhost:5173/payment-callback?vnp_ResponseCode=...`
5. On the callback page, check the URL parameters. If `vnp_ResponseCode === '00'`, display a payment success page!
