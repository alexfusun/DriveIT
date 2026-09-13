package com.driveit.admin.dto;

import com.driveit.user.entity.Role;

import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(
    @NotNull Role role
) {}
