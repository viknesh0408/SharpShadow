package com.sharpshadow.marketplace.repository;

import com.sharpshadow.marketplace.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingRepository extends JpaRepository<Setting, String> {
    Optional<Setting> findBySettingKey(String settingKey);
}
