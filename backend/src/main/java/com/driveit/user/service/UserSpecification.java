package com.driveit.user.service;

import org.springframework.data.jpa.domain.Specification;

import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;

import jakarta.persistence.criteria.Predicate;

public final class UserSpecification {

    public static Specification<User> hasRole(Role role) {
        return (root, query, cb) ->
            role == null ? null : cb.equal(root.get("role"), role);
    }

    public static Specification<User> matchesSearch(String search) {
        return (root, query, cb) -> {
            if (search == null)
                return null;

            String pattern = "%" + search.toLowerCase() + "%";

            Predicate usernameMatch = cb.like(cb.lower(root.get("username")), pattern);
            Predicate emailMatch = cb.like(cb.lower(root.get("email")), pattern);

            return cb.or(usernameMatch, emailMatch);
        };
    }

}
