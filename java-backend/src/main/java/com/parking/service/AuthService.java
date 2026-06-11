package com.parking.service;

import com.parking.dto.auth.AuthResponse;
import com.parking.dto.auth.LoginRequest;
import com.parking.dto.auth.RefreshTokenRequest;
import com.parking.dto.auth.RegisterRequest;

import com.parking.dto.auth.ForgotPasswordRequest;
import com.parking.dto.auth.ResetPasswordRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);

    void requestPasswordReset(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
