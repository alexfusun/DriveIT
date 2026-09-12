package com.driveit.user.dto;

import java.time.Instant;

import com.driveit.user.entity.PublisherRank;
import com.driveit.user.entity.Role;

public record PublisherProfileResponse(
    Long id,
    String username,
    String email,
    Role role,
    PublisherRank rank,
    Integer totalLikes,
    int reviewCount,
    Instant createdAt
) {}
