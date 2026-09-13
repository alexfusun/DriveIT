package com.driveit.admin.dto;

import com.driveit.user.entity.PublisherRank;

import jakarta.validation.constraints.NotNull;

public record RankUpdateRequest(
    @NotNull PublisherRank rank
) {}
