package com.driveit.car.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.driveit.car.entity.Car;

public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car>  {

    @Query("SELECT DISTINCT c.year FROM Car c WHERE c.carModel.id = :modelId")
    List<Integer> findDistinctYearByCarModelId(@Param("modelId") Long modelId);


}
