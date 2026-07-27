package com.driveit.review.dto;

import com.driveit.user.entity.PublisherRank;

public record PublisherSummaryDto (
    Long id,
    String username,
    PublisherRank rank,
    Integer totalLikes
) {}