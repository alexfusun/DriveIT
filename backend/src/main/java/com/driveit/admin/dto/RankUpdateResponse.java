package com.driveit.admin.dto;

import com.driveit.user.entity.PublisherRank;

public record RankUpdateResponse (
    Long id,
    String username,
    PublisherRank rank,
    Integer totalLikes
) {}
