package com.driveit.brand.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.driveit.brand.entity.CarModel;

public interface CarModelRepository extends JpaRepository<CarModel, Long> {

    List<CarModel> findByBrandId(Long id);

}
