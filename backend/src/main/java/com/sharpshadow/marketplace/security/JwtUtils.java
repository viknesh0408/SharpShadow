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

    private static final java.util.Set<String> BLOCKED_SECRETS = java.util.Set.of(
            "404e635266556a586e3272357538782f413f4428472b4b6250645367566b5970",
            "c816d4715b28e5bd9d9fd711911574b08d5da0eb4ffa5059be3fd6fc4109b87b",
            "ec8d6de3ef72a993b8f4731e1802be6f7903e93806d292e00982a08b452669e3"
    );

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.core.env.Environment environment;

    @PostConstruct
    public void validateSecret() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            boolean isDev = java.util.Arrays.asList(environment.getActiveProfiles()).contains("dev");
            if (isDev) {
                byte[] randomBytes = new byte[32];
                new java.security.SecureRandom().nextBytes(randomBytes);
                this.jwtSecret = java.util.HexFormat.of().formatHex(randomBytes);
                return;
            }
            throw new IllegalStateException("CRITICAL SECURITY ERROR: 'sharpshadow.jwt.secret' (JWT_SECRET) is not configured! A 256-bit secret is required.");
        }
        if (BLOCKED_SECRETS.contains(jwtSecret.trim().toLowerCase())) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: A known insecure / leaked JWT secret was detected. You MUST generate a new secure 256-bit JWT_SECRET in your environment!");
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
