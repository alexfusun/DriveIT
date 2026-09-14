package com.driveit.like.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.driveit.like.entity.ReviewLike;

public interface LikeRepository extends JpaRepository<ReviewLike, Long> {

    boolean existsByReviewIdAndUserId(Long reviewId, Long userId);

    Optional<ReviewLike> findByReviewIdAndUserId(Long reviewId, Long userId);

    long countByUserId(Long userId);

    @Query("SELECT rl.review.id FROM ReviewLike rl WHERE rl.user.id = :userId AND rl.review.id IN :reviewIds")
    List<Long> findLikedReviewIds(@Param("userId") Long userId, @Param("reviewIds") List<Long> reviewIds); // If userId == null it will return empty list

}
