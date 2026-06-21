package com.driveit.brand.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.driveit.brand.dto.BrandResponse;
import com.driveit.brand.dto.CarModelResponse;
import com.driveit.brand.entity.Brand;
import com.driveit.brand.entity.CarModel;
import com.driveit.brand.repository.BrandRepository;
import com.driveit.brand.repository.CarModelRepository;
import com.driveit.car.repository.CarRepository;
import com.driveit.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final CarModelRepository carModelRepository;
    private final CarRepository carRepository;

    public List<BrandResponse> getAllBrands() {
        List<BrandResponse> brands = new ArrayList<>();

        for (Brand brand : brandRepository.findAll()) {
            brands.add(new BrandResponse(
                brand.getId(), brand.getName(), 
                brand.getCountry(), brand.getLogoUrl())
            );
        }

        return brands;
    }

    public List<CarModelResponse> getModelsByBrand(Long brandId) {
        if (!brandRepository.existsById(brandId)) {
            throw new ResourceNotFoundException("Brand not found");
        }

        List<CarModelResponse> models = new ArrayList<>();

        for (CarModel model : carModelRepository.findByBrandId(brandId)) {
            models.add(new CarModelResponse(
                model.getId(), model.getName(),
                model.getBrand().getId(), carRepository.findDistinctYearByCarModelId(model.getId()))
            );
        }

        return models;
    }
    
}
