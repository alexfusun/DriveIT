package com.driveit.publisher.dto;

import java.time.Instant;

import com.driveit.user.entity.PublisherRank;

public record PublisherResponse(
    Long id,
    String username,
    PublisherRank rank,
    Integer totalLikes,
    Integer reviewCount,
    Instant createdAt
) {}
