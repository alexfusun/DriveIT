package com.driveit.review.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.driveit.exception.ResourceNotFoundException;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.review.dto.ReviewRequest;
import com.driveit.review.dto.ReviewResponse;
import com.driveit.review.service.ReviewService;
import com.driveit.user.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    private final UserRepository userRepository;

    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()))
            .getId();
    }

    @GetMapping("/api/v1/cars/{carId}/reviews")
    public ResponseEntity<ReviewPageResponse> getAllReviews(@PathVariable Long carId, @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "createdAt,desc") String sort,
                                                        Authentication authentication) {
        ReviewPageResponse result = reviewService.getReviews(carId, page, size, sort, getCurrentUserId(authentication));

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @PostMapping("/api/v1/cars/{carId}/reviews")
    public ResponseEntity<ReviewResponse> createReview(@PathVariable Long carId, @RequestBody @Valid ReviewRequest request,
                                                        Authentication authentication) {
        ReviewResponse result = reviewService.createReview(carId, request, getCurrentUserId(authentication));

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping("/api/v1/reviews/{id}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long id, @RequestBody @Valid ReviewRequest request,
                                                        Authentication authentication) {
        ReviewResponse result = reviewService.updateReview(id, request, getCurrentUserId(authentication));

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @DeleteMapping("/api/v1/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.deleteReview(id, getCurrentUserId(authentication), isAdmin);

        return ResponseEntity.noContent().build();
    }
    
}
