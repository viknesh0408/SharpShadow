package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.entity.Setting;
import com.sharpshadow.marketplace.repository.SettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SettingService {

    private final SettingRepository settingRepository;

    @PostConstruct
    public void initDefaults() {
        Map<String, String> defaults = Map.of(
                "social_github", "https://github.com/viknesh0408",
                "social_instagram", "https://instagram.com",
                "social_twitter", "https://x.com",
                "social_youtube", "",
                "social_linkedin", "https://linkedin.com",
                "social_discord", "",
                "public_contact_email", "sharpshadowss@gmail.com"
        );

        for (Map.Entry<String, String> entry : defaults.entrySet()) {
            if (settingRepository.findBySettingKey(entry.getKey()).isEmpty()) {
                settingRepository.save(Setting.builder()
                        .settingKey(entry.getKey())
                        .settingValue(entry.getValue())
                        .build());
            }
        }
    }

    @Transactional(readOnly = true)
    public Map<String, String> getAllSettings() {
        Map<String, String> result = new HashMap<>();
        settingRepository.findAll().forEach(s -> result.put(s.getSettingKey(), s.getSettingValue()));
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, String> getPublicSettings() {
        Map<String, String> result = new HashMap<>();
        settingRepository.findAll().forEach(s -> {
            if (s.getSettingKey().startsWith("social_") || s.getSettingKey().startsWith("public_")) {
                result.put(s.getSettingKey(), s.getSettingValue() != null ? s.getSettingValue() : "");
            }
        });
        return result;
    }

    @Transactional
    public Map<String, String> updateSettings(Map<String, String> newSettings) {
        if (newSettings != null) {
            for (Map.Entry<String, String> entry : newSettings.entrySet()) {
                Setting setting = settingRepository.findBySettingKey(entry.getKey())
                        .orElse(Setting.builder().settingKey(entry.getKey()).build());
                setting.setSettingValue(entry.getValue() != null ? entry.getValue().trim() : "");
                settingRepository.save(setting);
            }
        }
        return getAllSettings();
    }
}
