---
name: springboot-verification
description: Spring Boot verification loops, package compiling, Flyway database migration safety checks, static analyses, and Swagger OpenAPI schema validations.
---

# Spring Boot Verification Guide

Guidelines for validating Spring Boot codebase compilations, migrations, tests, and runtimes.

## When to Activate
- Validating code compiles cleanly and builds successfully
- Testing Flyway migrations and matching database schemas
- Running static code quality checks (checkstyle, spotbugs)
- Checking REST endpoints via Swagger OpenAPI dashboards

---

## Build, Test, and Package Verification

Always run maven lifecycle commands using the project's local wrappers or standard configurations:

```bash
# Clean classes and compile
mvn clean compile

# Compile and execute full test suite
mvn test

# Clean compile, test, and package application into executable JAR
mvn clean package
```

Ensure JVM version constraints (e.g. Java 17) match dependencies configured in the `pom.xml`.

---

## Flyway Migration Safety

Verify SQL migration scripts are located under `src/main/resources/db/migration/`:
- Check file names match format `V<Number>__<Description>.sql` (e.g. `V3__add_vnpay_payment_method.sql`).
- Test migration execution cleanly against temporary/in-memory test databases (e.g., using H2 during test profiles) to avoid polluting local PostgreSQL data.
- Drop/alter table constraints safely using conditional statements:
  ```sql
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
  ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('CASH', 'TRANSFER', 'EWALLET', 'VNPAY'));
  ```

---

## Swagger OpenAPI Verification

Validate OpenAPI details and Swagger endpoints dynamically:
1. Start the Spring Boot application server:
   ```bash
   mvn spring-boot:run
   ```
2. Navigate to Swagger web UI in the browser to verify REST APIs:
   - URL: `http://localhost:8080/swagger-ui/index.html` or `http://localhost:8080/swagger-ui.html`
   - OpenAPI raw JSON specification: `http://localhost:8080/v3/api-docs`
3. Verify `@Tag` and description annotations match endpoints, ensuring all exposed REST APIs are documented.
