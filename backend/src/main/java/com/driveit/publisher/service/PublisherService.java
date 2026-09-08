package com.driveit.publisher.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.driveit.common.PageResponse;
import com.driveit.publisher.dto.PublisherMapper;
import com.driveit.publisher.dto.PublisherResponse;
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
}
