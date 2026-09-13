package com.driveit.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.driveit.exception.ResourceNotFoundException;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.user.dto.UserUpdateRequest;
import com.driveit.user.repository.UserRepository;
import com.driveit.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequiredArgsConstructor 
public class UserController {

    private final UserService userService;

    private final UserRepository userRepository;

    private Long getCurrentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()))
            .getId();
    }


    @GetMapping("/api/v1/users/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        Object result = userService.getMyProfile(getCurrentUserId(authentication));

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @PutMapping("/api/v1/users/me")
    public ResponseEntity<?> updateMyProfile(Authentication authentication, @RequestBody @Valid UserUpdateRequest request) {
        Object result = userService.updateMyProfile(getCurrentUserId(authentication), request);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/api/v1/users/me/reviews")
    public ResponseEntity<ReviewPageResponse> getMyReviews(Authentication authentication, 
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        ReviewPageResponse result = userService.getMyReviews(getCurrentUserId(authentication), page, size, sort);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

}
