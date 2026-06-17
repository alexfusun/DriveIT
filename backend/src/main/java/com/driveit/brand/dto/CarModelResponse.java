package com.driveit.brand.dto;

import java.util.List;

public record CarModelResponse(
    Long id,
    String name,
    Long brandId,
    List<Integer> years
) {}
