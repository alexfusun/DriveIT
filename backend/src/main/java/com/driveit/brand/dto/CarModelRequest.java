package com.driveit.brand.dto;

import jakarta.validation.constraints.NotBlank;

public record CarModelRequest(
    @NotBlank String name
) {}
