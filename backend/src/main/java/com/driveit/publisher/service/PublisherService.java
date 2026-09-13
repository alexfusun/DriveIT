package com.driveit.publisher.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.driveit.common.PageResponse;
import com.driveit.exception.ResourceNotFoundException;
import com.driveit.publisher.dto.PublisherMapper;
import com.driveit.publisher.dto.PublisherResponse;
import com.driveit.review.dto.ReviewMapper;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.review.dto.ReviewResponse;
import com.driveit.review.entity.Review;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.entity.PublisherRank;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class PublisherService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public PageResponse<PublisherResponse> getPublishers(PublisherRank rank, int page, int size) {
        Page<User> users;
        Sort sort = Sort.by(Sort.Direction.DESC, "totalLikes");
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sort);

        if (rank != null) {
            users = userRepository.findByRoleAndRank(Role.PUBLISHER, rank, pageable);
        } else {
            users = userRepository.findByRole(Role.PUBLISHER, pageable);
        }

        List<PublisherResponse> content = users.getContent().stream()
            .map(PublisherMapper::toResponse)
            .toList();

        return new PageResponse<>(
            content,
            users.getTotalElements(),
            users.getTotalPages(),
            users.getNumber(),
            users.getSize()
        );
    }

    public PublisherResponse getPublisherById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cannot find user with id: " + id));
        if (!user.getRole().equals(Role.PUBLISHER))
            throw new ResourceNotFoundException("User is not a publisher");

        return PublisherMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public ReviewPageResponse getPublisherReviews(Long publisherId, int page, int size, String sort) {
        User user = userRepository.findById(publisherId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + publisherId));
        if (!user.getRole().equals(Role.PUBLISHER))
            throw new ResourceNotFoundException("User is not a publisher");

        String[] sortParts = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParts.length > 1 ? sortParts[1] : "asc");
        Sort sortOrder = Sort.by(direction, sortParts[0]);

        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sortOrder);

        Page<Review> reviews = reviewRepository.findByPublisherId(publisherId, pageable);

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
