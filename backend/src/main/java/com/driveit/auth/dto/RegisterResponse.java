package com.driveit.auth.dto;

import java.time.Instant;
import com.driveit.user.entity.Role;

public record RegisterResponse(
    Long id,
    String username,
    String email,
    Role role,
    Instant createdAt
) {}