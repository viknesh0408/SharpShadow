package com.sharpshadow.marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MarketplaceApplication {

    public static void main(String[] args) {
        String activeProfile = System.getenv("SPRING_PROFILES_ACTIVE");
        if (activeProfile == null || activeProfile.isBlank()) {
            if (System.getenv("PGHOST") != null || System.getenv("DATABASE_URL") != null) {
                System.setProperty("spring.profiles.active", "postgres");
            } else if (System.getenv("MYSQLHOST") != null) {
                System.setProperty("spring.profiles.active", "mysql");
            }
        }
        SpringApplication.run(MarketplaceApplication.class, args);
    }
}
