package com.driveit.car.dto;

import com.driveit.car.entity.Drivetrain;
import com.driveit.car.entity.Transmission;

public record CarSpecsDto(
    EngineDto engine,
    DimensionsDto dimensions,
    PerformanceDto performance,
    Transmission transmission,
    Drivetrain drivetrain,
    Integer doors,
    Integer seats
) {}
