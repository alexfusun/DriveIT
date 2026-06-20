package com.driveit.car.dto;

import java.util.Comparator;

import com.driveit.car.entity.Car;
import com.driveit.car.entity.CarImage;
import com.driveit.car.entity.CarSpec;

public class CarMapper {

    public static CarSummaryResponse toSummaryResponse(Car car) {
        return new CarSummaryResponse(
            car.getId(),
            car.getBrand().getName(),
            car.getCarModel().getName(),
            car.getVersion(),
            car.getYear(),
            car.getPrice(),
            car.getSpec().getFuelType(),
            car.getSpec().getHorsepower(),
            car.getSpec().getTransmission(),
            car.getImageUrl(),
            car.getAverageRating(),
            car.getReviewCount()
        );
    }

    public static CarDetailResponse toDetailResponse(Car car) {
        CarSpec spec = car.getSpec();

        EngineDto engine = new EngineDto(
            spec.getDisplacement(), spec.getHorsepower(), spec.getTorque(),
            spec.getFuelType(), spec.getCylinders(), spec.getConsumption(), spec.getEmissions()
        );

        DimensionsDto dimensions = new DimensionsDto(
            spec.getLength(), spec.getWidth(), spec.getHeight(), spec.getWheelbase(), spec.getTrunkCapacity()
        );

        PerformanceDto performance = new PerformanceDto(
            spec.getAcceleration0To100(), spec.getTopSpeed()
        );

        CarSpecsDto specs = new CarSpecsDto(
            engine, dimensions, performance,
            spec.getTransmission(), spec.getDrivetrain(), spec.getDoors(), spec.getSeats()
        );



        return new CarDetailResponse(
            car.getId(),
            car.getBrand().getName(),
            car.getCarModel().getName(),
            car.getVersion(),
            car.getYear(),
            car.getPrice(),
            specs,
            car.getImages().stream().sorted(Comparator.comparing(CarImage::getPosition)).map(CarImage::getUrl).toList(),
            car.getAverageRating(),
            car.getReviewCount()
        );
    }
    
}
