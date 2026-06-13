package com.driveit.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.driveit.auth.dto.LoginRequest;
import com.driveit.auth.dto.LoginResponse;
import com.driveit.auth.dto.RegisterRequest;
import com.driveit.auth.dto.RegisterResponse;
import com.driveit.auth.security.JwtUtil;
import com.driveit.exception.ConflictException;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;
import com.driveit.user.entity.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    
    @Value("${jwt.expiration}")
    private long expiration;

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Name already in use");
        }

        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User();
        user.setEmail(request.email());
        user.setUsername(request.username());
        user.setPasswordHash(hashedPassword);
        user.setRole(Role.USER);

        User saved = userRepository.save(user);

        return (new RegisterResponse(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole(), saved.getCreatedAt()));
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        String token = jwtUtil.generateToken(request.email());

        return (new LoginResponse(token, "Bearer", expiration));
    }
    
}
