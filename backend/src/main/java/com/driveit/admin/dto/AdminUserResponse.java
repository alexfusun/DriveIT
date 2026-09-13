package com.driveit.admin.dto;

import java.time.Instant;

import com.driveit.user.entity.PublisherRank;
import com.driveit.user.entity.Role;

public record AdminUserResponse(
    Long id,
    String username,
    String email,
    Role role,
    PublisherRank rank,
    Instant createdAt
) {}
