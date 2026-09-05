package com.driveit.like.service;

import org.springframework.stereotype.Service;

import com.driveit.exception.ConflictException;
import com.driveit.exception.ResourceNotFoundException;
import com.driveit.like.dto.LikeResponse;
import com.driveit.like.entity.ReviewLike;
import com.driveit.like.repository.LikeRepository;
import com.driveit.review.entity.Review;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public LikeResponse likeReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: "+ userId));
        
        if (likeRepository.existsByReviewIdAndUserId(reviewId, userId)) {
            throw new ConflictException("User has already liked this review");
        }

        ReviewLike reviewLike = new ReviewLike();
        reviewLike.setReview(review);
        reviewLike.setUser(user);
        likeRepository.save(reviewLike);
        review.setLikeCount(review.getLikeCount() + 1);
        reviewRepository.save(review);

        return new LikeResponse(reviewId, review.getLikeCount(), true);
    }

    public LikeResponse unlikeReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        ReviewLike reviewLike = likeRepository.findByReviewIdAndUserId(reviewId, userId).orElseThrow(() -> new ResourceNotFoundException("User has not liked this review"));
        

        likeRepository.delete(reviewLike);
        review.setLikeCount(review.getLikeCount() - 1);
        reviewRepository.save(review);

        return new LikeResponse(reviewId, review.getLikeCount(), false);
    }
}
