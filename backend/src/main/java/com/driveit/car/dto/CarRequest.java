package com.driveit.car.dto;

import java.math.BigDecimal;
import java.util.List;

public record CarRequest(
    Long brandId,
    Long modelId, 
    String version, 
    Integer year, 
    BigDecimal price, 
    String imageUrl, 
    CarSpecsDto specs, 
    List<String> images
) {}
