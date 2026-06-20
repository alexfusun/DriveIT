package com.driveit.car.dto;

import java.math.BigDecimal;
import java.util.List;

public record CarDetailResponse(
    Long id, 
    String brand, 
    String model, 
    String version, 
    Integer year,
    BigDecimal price, 
    CarSpecsDto specs,
    List<String> images,
    BigDecimal averageRating, 
    Integer reviewCount
) {}
