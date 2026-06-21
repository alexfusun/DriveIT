package com.driveit.brand.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.driveit.brand.dto.BrandResponse;
import com.driveit.brand.dto.CarModelResponse;
import com.driveit.brand.service.BrandService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping("")
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        List<BrandResponse> result = brandService.getAllBrands();

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/{id}/models")
    public ResponseEntity<List<CarModelResponse>> getModelsByBrand(@PathVariable Long id) {
        List<CarModelResponse> result = brandService.getModelsByBrand(id);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
    
}
