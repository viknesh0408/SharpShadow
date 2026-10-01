package com.sharpshadow.marketplace.service;

import com.sharpshadow.marketplace.dto.*;
import com.sharpshadow.marketplace.entity.Role;
import com.sharpshadow.marketplace.entity.User;
import com.sharpshadow.marketplace.exception.BadRequestException;
import com.sharpshadow.marketplace.exception.ConflictException;
import com.sharpshadow.marketplace.exception.ResourceNotFoundException;
import com.sharpshadow.marketplace.mapper.EntityDtoMapper;
import com.sharpshadow.marketplace.repository.OrderRepository;
import com.sharpshadow.marketplace.repository.UserRepository;
import com.sharpshadow.marketplace.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EntityDtoMapper mapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateTokenFromEmail(savedUser.getEmail(), savedUser.getId(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(jwtUtils.getExpirationMs() / 1000)
                .user(mapper.toUserDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtils.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(jwtUtils.getExpirationMs() / 1000)
                .user(mapper.toUserDto(user))
                .build();
    }

    public AuthResponse adminLogin(LoginRequest request) {
        AuthResponse response = login(request);
        if (response.getUser().getRole() != Role.ADMIN) {
            throw new BadRequestException("Access denied: Not an administrator");
        }
        return response;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapper.toUserDto(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDto> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        Page<UserDto> dtos = users.map(user -> {
            UserDto dto = mapper.toUserDto(user);
            return dto;
        });
        return PageResponse.of(dtos);
    }

    @Transactional
    public void updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setRole(newRole);
        userRepository.save(user);
    }
}
