package com.driveit.admin.dto;

import com.driveit.user.entity.User;

public class AdminMapper {
    public static AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getRank(),
            user.getCreatedAt()
        );
    }

    public static RankUpdateResponse toRankResponse(User user) {
        return new RankUpdateResponse(
            user.getId(),
            user.getUsername(),
            user.getRank(),
            user.getTotalLikes()
        );
    }
}
