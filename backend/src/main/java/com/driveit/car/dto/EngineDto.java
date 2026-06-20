package com.driveit.car.dto;

import java.math.BigDecimal;

import com.driveit.car.entity.FuelType;

public record EngineDto (
    Integer displacement,
    Integer horsepower,
    Integer torque,
    FuelType fuelType,
    Integer cylinders,
    BigDecimal consumption,
    Integer emissions
) {}
