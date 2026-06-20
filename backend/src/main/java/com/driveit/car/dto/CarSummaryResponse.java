package com.driveit.car.dto;

import java.math.BigDecimal;

import com.driveit.car.entity.FuelType;
import com.driveit.car.entity.Transmission;

public record CarSummaryResponse(
    Long id,
    String brand,
    String model,
    String version,
    Integer year,
    BigDecimal price,
    FuelType fuelType,
    Integer horsepower,
    Transmission transmission,
    String imageUrl,
    BigDecimal averageRating,
    Integer reviewCount
) {}
