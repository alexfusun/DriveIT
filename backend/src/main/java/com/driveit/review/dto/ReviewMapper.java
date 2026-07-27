package com.driveit.review.dto;

import java.util.Comparator;

import com.driveit.review.entity.Review;
import com.driveit.review.entity.ReviewCon;
import com.driveit.review.entity.ReviewPro;

public class ReviewMapper {
    public static ReviewResponse toResponse(Review review, boolean likedByMe) {
        return new ReviewResponse(
            review.getId(),
            review.getCar().getId(),
            new PublisherSummaryDto(
                review.getPublisher().getId(),
                review.getPublisher().getUsername(),
                review.getPublisher().getRank(),
                review.getPublisher().getTotalLikes()
            ),
            review.getRating(),
            review.getTitle(),
            review.getBody(),
            review.getPros().stream().sorted(Comparator.comparing(ReviewPro::getPosition)).map(ReviewPro::getText).toList(),
            review.getCons().stream().sorted(Comparator.comparing(ReviewCon::getPosition)).map(ReviewCon::getText).toList(),
            review.getLikeCount(),
            likedByMe,
            review.getCreatedAt(),
            review.getUpdatedAt()
        );
    }
}