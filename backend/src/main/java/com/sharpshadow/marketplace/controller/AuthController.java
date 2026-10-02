package com.sharpshadow.marketplace.controller;

import com.sharpshadow.marketplace.dto.*;
import com.sharpshadow.marketplace.security.UserPrincipal;
import com.sharpshadow.marketplace.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Account created successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/admin-login")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.adminLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Admin authenticated successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request);
        // Always return the same message — never leak whether the email exists.
        return ResponseEntity.ok(ApiResponse.success(
                "If an account with this email exists, a password reset link has been sent to your inbox.",
                "Password reset request processed"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Password has been reset successfully. You can now log in with your new password.",
                "Password reset successful"
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated", "/api/auth/change-password"));
        }
        userService.changePassword(principal.getEmail(), request);
        return ResponseEntity.ok(ApiResponse.success("Your password has been changed successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated", "/api/auth/me"));
        }
        UserDto userDto = userService.getCurrentUserDto(principal.getEmail());
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated", "/api/auth/profile"));
        }
        UserDto updatedUser = userService.updateProfile(principal.getEmail(), request);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile name updated successfully"));
    }
}
