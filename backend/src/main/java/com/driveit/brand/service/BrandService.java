package com.driveit.brand.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.driveit.brand.dto.BrandRequest;
import com.driveit.brand.dto.BrandResponse;
import com.driveit.brand.dto.CarModelRequest;
import com.driveit.brand.dto.CarModelResponse;
import com.driveit.brand.entity.Brand;
import com.driveit.brand.entity.CarModel;
import com.driveit.brand.repository.BrandRepository;
import com.driveit.brand.repository.CarModelRepository;
import com.driveit.car.repository.CarRepository;
import com.driveit.exception.ConflictException;
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
            throw new ResourceNotFoundException("Brand not found with id: " + brandId);
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

    public BrandResponse createBrand(BrandRequest request) {
        if (brandRepository.existsByName(request.name())) {
            throw new ConflictException("Brand already exists");
        }

        Brand brand = new Brand();
        brand.setName(request.name());
        brand.setCountry(request.country());
        brand.setLogoUrl(request.logoUrl());
        Brand saved = brandRepository.save(brand);

        return new BrandResponse(saved.getId(), saved.getName(), saved.getCountry(), saved.getLogoUrl());
    }

    public CarModelResponse createModel(Long brandId, CarModelRequest request) {
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));

        if (carModelRepository.existsByBrandIdAndName(brandId, request.name())) {
            throw new ConflictException("Car model already exists");
        }

        CarModel model = new CarModel();
        model.setBrand(brand);
        model.setName(request.name());
        CarModel saved = carModelRepository.save(model);

        return new CarModelResponse(saved.getId(), saved.getName(), brandId, List.of());
    }
    
}
