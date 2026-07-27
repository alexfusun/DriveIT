package com.driveit.review.dto;

import java.util.List;

public record ReviewRequest(
    Integer rating,
    String title,
    String body,
    List<String> pros,
    List<String> cons
) {}
