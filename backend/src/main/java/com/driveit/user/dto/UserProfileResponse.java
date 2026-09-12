package com.driveit.user.dto;

import java.time.Instant;

import com.driveit.user.entity.Role;

public record UserProfileResponse(
    Long id,
    String username,
    String email,
    Role role,
    Long totalLikesGiven,
    Instant createdAt
) {}
