package com.driveit.car.dto;

import java.util.List;

public record CarCompareResponse(
    List<CarDetailResponse> cars,
    ComparisonHighlights highlights
) {}
