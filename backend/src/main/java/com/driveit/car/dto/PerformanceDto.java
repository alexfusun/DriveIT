package com.driveit.car.dto;

import java.math.BigDecimal;

public record PerformanceDto(
    BigDecimal acceleration0to100,
    Integer topSpeed
) {}
