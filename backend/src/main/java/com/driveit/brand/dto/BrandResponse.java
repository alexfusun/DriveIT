package com.driveit.brand.dto;

public record BrandResponse (
    Long id,
    String name,
    String country,
    String logoUrl
) {}
