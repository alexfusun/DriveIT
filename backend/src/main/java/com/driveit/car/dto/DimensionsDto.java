package com.driveit.car.dto;

public record DimensionsDto(
    Integer length,
    Integer width,
    Integer height,
    Integer wheelbase,
    Integer trunkCapacity
) {}
