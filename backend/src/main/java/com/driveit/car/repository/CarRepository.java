package com.driveit.car.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.driveit.car.entity.Car;

public interface CarRepository extends JpaRepository<Car, Long>  {

}
