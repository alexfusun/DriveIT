package com.driveit.like.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.driveit.exception.ResourceNotFoundException;
import com.driveit.like.dto.LikeResponse;
import com.driveit.like.service.LikeService;
import com.driveit.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class LikeController {

    private final UserRepository userRepository;

    private final LikeService likeService;

    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()))
            .getId();
    }

    @PostMapping("/api/v1/reviews/{reviewId}/like")
    public ResponseEntity<LikeResponse> createReviewLike(@PathVariable Long reviewId, Authentication authentication) {
       LikeResponse result = likeService.likeReview(reviewId, getCurrentUserId(authentication));

       return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @DeleteMapping("/api/v1/reviews/{reviewId}/like")
    public ResponseEntity<LikeResponse> deleteReviewLike(@PathVariable Long reviewId, Authentication authentication) {
        LikeResponse result = likeService.unlikeReview(reviewId, getCurrentUserId(authentication));

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

}
