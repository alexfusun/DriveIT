package com.driveit.car.service;

import java.math.BigDecimal;

import org.springframework.data.jpa.domain.Specification;

import com.driveit.car.entity.Car;
import com.driveit.car.entity.FuelType;

public final class CarSpecification {

    public static Specification<Car> hasBrand(String brand) {
        return (root, query, cb) ->
            brand == null ? null : cb.equal(root.get("brand").get("name"), brand);
    }

    public static Specification<Car> hasModel(String model) {
        return (root, query, cb) ->
            model == null ? null : cb.equal(root.get("carModel").get("name"), model);
    }

    public static Specification<Car> hasYear(Integer year) {
        return (root, query, cb) ->
            year == null ? null : cb.equal(root.get("year"), year);
    }

    public static Specification<Car> hasFuelType(FuelType fuelType) {
        return (root, query, cb) ->
            fuelType == null ? null : cb.equal(root.get("spec").get("fuelType"), fuelType);
    }

    public static Specification<Car> minPrice(BigDecimal min) {
        return (root, query, cb) ->
            min == null ? null : cb.greaterThanOrEqualTo(root.get("price"), min);
    }

     public static Specification<Car> maxPrice(BigDecimal max) {
        return (root, query, cb) ->
            max == null ? null : cb.lessThanOrEqualTo(root.get("price"), max);
    }
    
}
