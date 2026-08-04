package com.driveit.like.dto;

public record LikeResponse(
    Long reviewId,
    Integer likeCount,
    Boolean likedByMe
) {}
