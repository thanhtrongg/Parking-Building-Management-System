package com.parking.service;

import com.parking.dto.user.UserPasswordUpdateRequest;
import com.parking.dto.user.UserProfileUpdateRequest;
import com.parking.dto.user.UserResponse;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UserProfileUpdateRequest request);
    void updatePassword(String email, UserPasswordUpdateRequest request);
    UserResponse updateTheme(String email, String theme);
}
