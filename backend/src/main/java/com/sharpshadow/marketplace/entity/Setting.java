package com.sharpshadow.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Setting {

    @Id
    @Column(nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(columnDefinition = "TEXT")
    private String settingValue;
}
