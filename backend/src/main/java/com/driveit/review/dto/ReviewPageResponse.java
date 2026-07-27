package com.driveit.review.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ReviewPageResponse(
    List<ReviewResponse> content,
    long totalElements,
    int totalPages,
    int currentPage,
    BigDecimal averageRating,
    Map<Integer, Integer> ratingDistribution
) {}
