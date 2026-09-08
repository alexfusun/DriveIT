package com.driveit.publisher.dto;

import com.driveit.user.entity.User;

public class PublisherMapper {
    public static PublisherResponse toResponse(User user) {
        return new PublisherResponse(
            user.getId(),
            user.getUsername(),
            user.getRank(),
            user.getTotalLikes(),
            user.getReviewCount(),
            user.getCreatedAt()
        );
    }
}
