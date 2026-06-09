package com.parking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * In-memory sliding-window rate limiter per IP address.
 * Applied to auth endpoints and VNPay IPN to prevent brute-force and spam.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, Deque<Long>> requestCounts = new ConcurrentHashMap<>();

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void cleanupExpiredRequests() {
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);
        requestCounts.keySet().forEach(ip -> {
            requestCounts.computeIfPresent(ip, (k, deque) -> {
                while (!deque.isEmpty() && deque.peekFirst() < windowStart) {
                    deque.pollFirst();
                }
                return deque.isEmpty() ? null : deque;
            });
        });
    }

    @Value("${app.rate-limit.max-requests:30}")
    private int maxRequests;

    @Value("${app.rate-limit.window-seconds:60}")
    private int windowSeconds;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String clientIp = getClientIp(request);
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);

        final long finalWindowStart = windowStart;
        final long finalNow = now;
        final boolean[] allowed = {true};

        requestCounts.compute(clientIp, (ip, deque) -> {
            if (deque == null) {
                deque = new ConcurrentLinkedDeque<>();
            }
            while (!deque.isEmpty() && deque.peekFirst() < finalWindowStart) {
                deque.pollFirst();
            }
            if (deque.size() >= maxRequests) {
                allowed[0] = false;
            } else {
                deque.addLast(finalNow);
            }
            return deque;
        });

        if (!allowed[0]) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setHeader("Retry-After", String.valueOf(windowSeconds));
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\",\"data\":null}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Only rate-limit auth endpoints and VNPay IPN
        return !path.startsWith("/auth/") && !path.equals("/payments/vnpay/ipn");
    }

    private String getClientIp(HttpServletRequest request) {
        // Safe from IP spoofing because server.forward-headers-strategy=framework is configured in application.yml
        return request.getRemoteAddr();
    }
}
