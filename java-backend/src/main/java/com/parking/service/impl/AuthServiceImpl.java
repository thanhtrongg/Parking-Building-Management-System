package com.parking.service.impl;

import com.parking.dto.auth.AuthResponse;
import com.parking.dto.auth.LoginRequest;
import com.parking.dto.auth.RefreshTokenRequest;
import com.parking.dto.auth.RegisterRequest;
import com.parking.dto.user.UserResponse;
import com.parking.entity.RefreshToken;
import com.parking.entity.User;
import com.parking.enums.UserRole;
import com.parking.exception.BadRequestException;
import com.parking.exception.DuplicateResourceException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.RefreshTokenRepository;
import com.parking.repository.UserRepository;
import com.parking.security.JwtTokenProvider;
import com.parking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parking.dto.auth.ForgotPasswordRequest;
import com.parking.dto.auth.ResetPasswordRequest;
import com.parking.entity.PasswordResetToken;
import com.parking.repository.PasswordResetTokenRepository;
import com.parking.service.NotificationService;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final NotificationService notificationService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.DRIVER)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Revoke all existing refresh tokens on new login
        refreshTokenRepository.revokeAllByUserId(user.getId());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String tokenType = jwtTokenProvider.getTokenTypeFromToken(token);
        if (!"REFRESH".equals(tokenType)) {
            throw new BadRequestException("Invalid token type. Refresh token required.");
        }

        // Validate token exists in DB and is not revoked
        RefreshToken storedToken = refreshTokenRepository.findByTokenAndRevokedFalse(token)
                .orElseThrow(() -> new BadRequestException("Refresh token has been revoked or does not exist"));

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.revokeByToken(token);
            throw new BadRequestException("Refresh token has expired");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!user.isActive()) {
            throw new BadRequestException("User account is deactivated");
        }

        // Rotate: revoke old token, issue new pair
        refreshTokenRepository.revokeByToken(token);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.revokeByToken(refreshToken);
    }

    @Override
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Revoke existing token if any
        passwordResetTokenRepository.findByUser(user)
                .ifPresent(passwordResetTokenRepository::delete);

        // Generate token and expiry (15 mins)
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email (currently logged as stub)
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        notificationService.sendPasswordResetToken(user.getEmail(), token, resetUrl);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate token
        passwordResetTokenRepository.delete(resetToken);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateToken(user);
        String refreshJwt = jwtTokenProvider.generateRefreshToken(user);

        // Persist the refresh token in DB
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshJwt)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .theme(user.getTheme())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshJwt)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }
}
