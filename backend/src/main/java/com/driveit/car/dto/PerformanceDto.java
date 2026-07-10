package com.driveit.car.dto;

import java.math.BigDecimal;

public record PerformanceDto(
    BigDecimal acceleration0To100,
    Integer topSpeed
) {}
