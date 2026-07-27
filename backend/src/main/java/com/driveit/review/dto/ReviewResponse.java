package com.driveit.review.dto;

import java.time.Instant;
import java.util.List;

public record ReviewResponse(
    Long id, 
    Long carId, 
    PublisherSummaryDto publisher, 
    Integer rating, 
    String title, 
    String body, 
    List<String> pros, 
    List<String> cons, 
    Integer likeCount, 
    Boolean likedByMe, 
    Instant createdAt, 
    Instant updatedAt
) {}
