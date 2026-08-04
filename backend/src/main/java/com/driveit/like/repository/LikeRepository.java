package com.driveit.like.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.driveit.like.entity.ReviewLike;

public interface LikeRepository extends JpaRepository<ReviewLike, Long> {

    boolean existsByReviewIdAndUserId(Long reviewId, Long userId);

    Optional<ReviewLike> findByReviewIdAndUserId(Long reviewId, Long userId);
    
}
