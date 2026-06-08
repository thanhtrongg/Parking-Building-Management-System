package com.parking.service;

import com.parking.dto.auth.AuthResponse;
import com.parking.dto.auth.LoginRequest;
import com.parking.dto.auth.RefreshTokenRequest;
import com.parking.dto.auth.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);
}
