package com.driveit.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.driveit.auth.dto.RegisterRequest;
import com.driveit.auth.dto.RegisterResponse;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;
import com.driveit.user.entity.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Name already in use");
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
    
}
