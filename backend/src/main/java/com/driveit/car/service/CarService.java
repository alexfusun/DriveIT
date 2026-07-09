package com.driveit.car.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.driveit.car.dto.CarDetailResponse;
import com.driveit.car.dto.CarMapper;
import com.driveit.car.dto.CarSummaryResponse;
import com.driveit.car.entity.Car;
import com.driveit.car.entity.FuelType;
import com.driveit.car.repository.CarRepository;
import com.driveit.common.PageResponse;
import com.driveit.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;

    public PageResponse<CarSummaryResponse> getCars(String brand, String model, Integer year, FuelType fuelType, BigDecimal minPrice, BigDecimal maxPrice, int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParts.length > 1 ? sortParts[1] : "asc");
        Sort sortOrder = Sort.by(direction, sortParts[0]);

        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sortOrder);

        Specification<Car> spec = Specification.allOf(
            CarSpecification.hasBrand(brand),
            CarSpecification.hasModel(model),
            CarSpecification.hasYear(year),
            CarSpecification.hasFuelType(fuelType),
            CarSpecification.minPrice(minPrice),
            CarSpecification.maxPrice(maxPrice)
        );

        Page<Car> result = carRepository.findAll(spec, pageable);

        List<CarSummaryResponse> content = result.getContent().stream()
            .map(CarMapper::toSummaryResponse)
            .toList();

        return new PageResponse<>(
            content,
            result.getTotalElements(),
            result.getTotalPages(),
            result.getNumber(),
            result.getSize()
        );
    }

    public CarDetailResponse getCarById(Long id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));

        return CarMapper.toDetailResponse(car);
    }
    
}
