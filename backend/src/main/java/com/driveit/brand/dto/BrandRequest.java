package com.driveit.brand.dto;

import jakarta.validation.constraints.NotBlank;

public record BrandRequest(
    @NotBlank String name,
    String country,
    String logoUrl
) {}
