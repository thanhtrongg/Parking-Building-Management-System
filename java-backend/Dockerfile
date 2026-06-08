# ============================================================================
# Multi-stage Dockerfile for Parking Building Management System
# Stage 1: Build with Maven
# Stage 2: Run with lightweight JRE
# ============================================================================

# --- Build Stage ---
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Runtime Stage ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Add non-root user for security
RUN addgroup -S parking && adduser -S parking -G parking

COPY --from=builder /app/target/*.jar app.jar

RUN chown parking:parking app.jar
USER parking

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/auth/login || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
