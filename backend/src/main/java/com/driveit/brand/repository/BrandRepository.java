package com.driveit.brand.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.driveit.brand.entity.Brand;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    
}
