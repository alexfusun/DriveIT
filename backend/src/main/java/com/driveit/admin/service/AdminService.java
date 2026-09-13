package com.driveit.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.driveit.admin.dto.AdminMapper;
import com.driveit.admin.dto.AdminUserResponse;
import com.driveit.admin.dto.RankUpdateResponse;
import com.driveit.common.PageResponse;
import com.driveit.exception.BadRequestException;
import com.driveit.exception.ResourceNotFoundException;
import com.driveit.user.entity.PublisherRank;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;
import com.driveit.user.service.UserSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor 
public class AdminService {

    private final UserRepository userRepository;

    public PageResponse<AdminUserResponse> getUsers(Role role, String search, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.ASC, "email");
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sort);

        Specification<User> spec = Specification.allOf(
            UserSpecification.hasRole(role),
            UserSpecification.matchesSearch(search)
        );

        Page<User> users = userRepository.findAll(spec, pageable);

        List<AdminUserResponse> content = users.getContent().stream()
            .map(AdminMapper::toResponse)
            .toList();

        return new PageResponse<>(
            content,
            users.getTotalElements(),
            users.getTotalPages(),
            users.getNumber(),
            users.getSize()
        );
    }

    public AdminUserResponse changeUserRole(Long id, Role newRole) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cannot find user with id: " + id));

        if (newRole == Role.ADMIN)
            throw new BadRequestException("Cannot change user role to Admin");
        
        if (!user.getRole().equals(Role.PUBLISHER) && newRole.equals(Role.PUBLISHER))
            user.setRank(PublisherRank.BRONZE);
        
        if (!user.getRole().equals(Role.USER) && newRole.equals(Role.USER))
            user.setRank(null);
        
        user.setRole(newRole);
        userRepository.save(user);

        return AdminMapper.toResponse(user);
    }

    public RankUpdateResponse changeUserRank(Long id, PublisherRank newRank) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cannot find user with id: " + id));
        
        if (!user.getRole().equals(Role.PUBLISHER))
            throw new BadRequestException("Cannot change rank on a user who is not Publisher");
        
        user.setRank(newRank);
        userRepository.save(user);

        return AdminMapper.toRankResponse(user);
    }

}
