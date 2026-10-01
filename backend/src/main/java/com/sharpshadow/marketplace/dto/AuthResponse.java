package com.sharpshadow.marketplace.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String type; // Bearer
    private Long expiresIn;
    private UserDto user;
}
