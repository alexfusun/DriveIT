package com.driveit.user.repository;

import com.driveit.user.entity.PublisherRank;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByRoleAndRank(Role role, PublisherRank publisherRank, Pageable pageable);

}
