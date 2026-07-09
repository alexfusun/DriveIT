package com.driveit.car.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.driveit.car.entity.Car;

public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car>  {

    List<Integer> findDistinctYearByCarModelId(Long modelId);

}
