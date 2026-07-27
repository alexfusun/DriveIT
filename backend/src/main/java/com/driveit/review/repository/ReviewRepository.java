package com.driveit.review.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.driveit.review.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByCarId(Long carId, Pageable pageable);

    boolean existsByCarIdAndPublisherId(Long carId, Long publisherId);
    
}
