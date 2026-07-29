package com.driveit.review.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.driveit.car.entity.Car;
import com.driveit.car.repository.CarRepository;
import com.driveit.exception.ResourceNotFoundException;
import com.driveit.review.dto.ReviewMapper;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.review.dto.ReviewResponse;
import com.driveit.review.entity.Review;
import com.driveit.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final CarRepository carRepository;
    private final ReviewRepository reviewRepository;
    
    public ReviewPageResponse getReviews(Long carId, int page, int size,
                                        String sort, Long currentUserId) 
    {
        Car car = carRepository.findById(carId).orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));              
        
        String[] sortParts = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParts.length > 1 ? sortParts[1] : "asc");
        Sort sortOrder = Sort.by(direction, sortParts[0]);

        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sortOrder);

        Page<Review> reviews = reviewRepository.findByCarId(carId, pageable);

        List<ReviewResponse> content = reviews.getContent().stream()
            .map(r -> ReviewMapper.toResponse(r, false))
            .toList();

        Map<Integer, Integer> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            int rating = i;
            ratingDistribution.put(i, (int) reviews.getContent().stream()
                .filter(r -> r.getRating() == rating).count());
        }

        return new ReviewPageResponse(
            content,
            reviews.getTotalElements(),
            reviews.getTotalPages(),
            reviews.getNumber(),
            car.getAverageRating(),
            ratingDistribution
        );
    }

}
