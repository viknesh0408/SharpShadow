package com.sharpshadow.marketplace.dto;

import com.sharpshadow.marketplace.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
    private Long orderCount;
    private java.math.BigDecimal totalSpent;
}
