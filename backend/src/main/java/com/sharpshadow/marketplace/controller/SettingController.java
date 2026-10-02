package com.sharpshadow.marketplace.controller;

import com.sharpshadow.marketplace.dto.ApiResponse;
import com.sharpshadow.marketplace.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    @GetMapping("/settings/public")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicSettings() {
        Map<String, String> settings = settingService.getPublicSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @GetMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAllSettings() {
        Map<String, String> settings = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateSettings(@RequestBody Map<String, String> newSettings) {
        Map<String, String> updated = settingService.updateSettings(newSettings);
        return ResponseEntity.ok(ApiResponse.success(updated, "Settings updated successfully"));
    }
}
