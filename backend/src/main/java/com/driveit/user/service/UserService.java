package com.driveit.user.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.driveit.exception.ConflictException;
import com.driveit.exception.ResourceNotFoundException;
import com.driveit.like.repository.LikeRepository;
import com.driveit.review.dto.ReviewMapper;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.review.dto.ReviewResponse;
import com.driveit.review.entity.Review;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.dto.PublisherProfileResponse;
import com.driveit.user.dto.UserProfileResponse;
import com.driveit.user.dto.UserUpdateRequest;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor 
public class UserService {
    
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;
    private final PasswordEncoder passwordEncoder;

    private Object buildProfileResponse(User user) {
        Object result;

        if (user.getRole().equals(Role.PUBLISHER)) {
            result = new PublisherProfileResponse(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getRole(), user.getRank(), user.getTotalLikes(), 
                user.getReviewCount(), user.getCreatedAt()
            );
        } else {
            result = new UserProfileResponse(
                user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                likeRepository.countByUserId(user.getId()), user.getCreatedAt()
            );
        }

        return result;
    }

    public Object getMyProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Cannot find user with id: " + userId));

        return buildProfileResponse(user);
    }

    public Object updateMyProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Cannot find user with id: " + userId));

        if (request.username() != null && !request.username().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.username()))
                throw new ConflictException("Username already in use");
            user.setUsername(request.username());
        }

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email()))
                throw new ConflictException("Email already in use");
            user.setEmail(request.email());
        }
        
        if (request.password() != null) {
            String hashedPassword = passwordEncoder.encode(request.password());
            user.setPasswordHash(hashedPassword);
        }
        
        userRepository.save(user);

        return buildProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public ReviewPageResponse getMyReviews(Long userId, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParts.length > 1 ? sortParts[1] : "asc");
        Sort sortOrder = Sort.by(direction, sortParts[0]);

        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sortOrder);

        Page<Review> reviews = reviewRepository.findByPublisherId(userId, pageable);

        List<ReviewResponse> content = reviews.getContent().stream()
            .map(r -> ReviewMapper.toResponse(r, false))
            .toList();

        return new ReviewPageResponse(
            content,
            reviews.getTotalElements(),
            reviews.getTotalPages(),
            reviews.getNumber(),
            null,
            null
        );
    }

}
