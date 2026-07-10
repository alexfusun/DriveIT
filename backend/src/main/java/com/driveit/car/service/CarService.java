package com.driveit.car.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.driveit.brand.entity.Brand;
import com.driveit.brand.entity.CarModel;
import com.driveit.brand.repository.BrandRepository;
import com.driveit.brand.repository.CarModelRepository;
import com.driveit.car.dto.CarDetailResponse;
import com.driveit.car.dto.CarMapper;
import com.driveit.car.dto.CarRequest;
import com.driveit.car.dto.CarSummaryResponse;
import com.driveit.car.entity.Car;
import com.driveit.car.entity.CarImage;
import com.driveit.car.entity.CarSpec;
import com.driveit.car.entity.FuelType;
import com.driveit.car.repository.CarRepository;
import com.driveit.common.PageResponse;
import com.driveit.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final BrandRepository brandRepository;
    private final CarModelRepository carModelRepository;

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

    public CarDetailResponse createCar(CarRequest request) {
        Brand brand = brandRepository.findById(request.brandId()).
            orElseThrow(() -> new ResourceNotFoundException("Car not found"));
        CarModel model = carModelRepository.findById(request.modelId()).
            orElseThrow(() -> new ResourceNotFoundException("Model not found"));

        Car car = new Car();
        car.setBrand(brand);
        car.setCarModel(model);
        car.setVersion(request.version());
        car.setYear(request.year());
        car.setPrice(request.price());
        car.setImageUrl(request.imageUrl());

        CarSpec carSpec = new CarSpec();
        carSpec.setCar(car);
        carSpec.setDisplacement(request.specs().engine().displacement());
        carSpec.setHorsepower(request.specs().engine().horsepower());
        carSpec.setTorque(request.specs().engine().torque());
        carSpec.setFuelType(request.specs().engine().fuelType());
        carSpec.setCylinders(request.specs().engine().cylinders());
        carSpec.setConsumption(request.specs().engine().consumption());
        carSpec.setEmissions(request.specs().engine().emissions());
        carSpec.setLength(request.specs().dimensions().length());
        carSpec.setWidth(request.specs().dimensions().width());
        carSpec.setHeight(request.specs().dimensions().height());
        carSpec.setWheelbase(request.specs().dimensions().wheelbase());
        carSpec.setTrunkCapacity(request.specs().dimensions().trunkCapacity());
        carSpec.setAcceleration0To100(request.specs().performance().acceleration0To100());
        carSpec.setTopSpeed(request.specs().performance().topSpeed());
        carSpec.setTransmission(request.specs().transmission());
        carSpec.setDrivetrain(request.specs().drivetrain());
        carSpec.setDoors(request.specs().doors());
        carSpec.setSeats(request.specs().seats());

        car.setSpec(carSpec);

        for (int i = 0; i < request.images().size(); i++) {
            CarImage carImage = new CarImage();
            carImage.setCar(car);
            carImage.setUrl(request.images().get(i));
            carImage.setPosition(i);
            car.getImages().add(carImage);
        }

        carRepository.save(car);

        return CarMapper.toDetailResponse(car);
    }
    
}
