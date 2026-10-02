package com.sharpshadow.marketplace.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtils {

    @Value("${sharpshadow.jwt.secret}")
    private String jwtSecret;

    @Value("${sharpshadow.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private static final String LEAKED_PUBLIC_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @PostConstruct
    public void validateSecret() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: 'sharpshadow.jwt.secret' (JWT_SECRET) is not configured! A 256-bit secret is required.");
        }
        if (LEAKED_PUBLIC_SECRET.equalsIgnoreCase(jwtSecret.trim())) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: The old public leaked JWT secret was detected. You MUST generate a new secure JWT_SECRET in your environment!");
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret.trim());
        } catch (Exception e) {
            keyBytes = jwtSecret.trim().getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits (32 bytes)");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateTokenFromEmail(userPrincipal.getEmail(), userPrincipal.getId(), userPrincipal.getRole().name());
    }

    public String generateTokenFromEmail(String email, Long userId, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public long getExpirationMs() {
        return jwtExpirationMs;
    }
}
