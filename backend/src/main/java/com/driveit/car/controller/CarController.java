package com.driveit.car.controller;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.driveit.car.dto.CarDetailResponse;
import com.driveit.car.dto.CarSummaryResponse;
import com.driveit.car.entity.FuelType;
import com.driveit.car.service.CarService;
import com.driveit.common.PageResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/cars")
@RequiredArgsConstructor
public class CarController {
    
    private final CarService carService;

    @GetMapping("")
    public ResponseEntity<PageResponse<CarSummaryResponse>> getCars(@RequestParam(required = false) String brand, @RequestParam(required = false) String model, 
                                                        @RequestParam(required=false) Integer year, @RequestParam(required=false) FuelType fuelType, 
                                                        @RequestParam(required=false) BigDecimal minPrice, @RequestParam(required=false) BigDecimal maxPrice, 
                                                        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size, @RequestParam(defaultValue = "year,desc") String sort) {
        PageResponse<CarSummaryResponse> result = carService.getCars(brand, model, year, fuelType, 
                                                            minPrice, maxPrice, page, size, sort);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarDetailResponse> getCarById(@PathVariable Long id) {
        CarDetailResponse result = carService.getCarById(id);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
}
