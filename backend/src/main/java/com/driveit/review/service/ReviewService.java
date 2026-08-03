package com.driveit.review.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
import com.driveit.exception.ConflictException;
import com.driveit.exception.ForbiddenException;
import com.driveit.exception.ResourceNotFoundException;
import com.driveit.review.dto.ReviewMapper;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.review.dto.ReviewRequest;
import com.driveit.review.dto.ReviewResponse;
import com.driveit.review.entity.Review;
import com.driveit.review.entity.ReviewCon;
import com.driveit.review.entity.ReviewPro;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final CarRepository carRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    
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

    public ReviewResponse createReview(Long carId, ReviewRequest request, Long publisherId) {
        Car car = carRepository.findById(carId).orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));
        User user = userRepository.findById(publisherId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + publisherId));
        
        if (reviewRepository.existsByCarIdAndPublisherId(carId, publisherId))
            throw new ConflictException("You have already reviewed this car");

        Review review = new Review();
        review.setCar(car);
        review.setPublisher(user);
        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setBody(request.body());
        review.setLikeCount(0);

        for (int i = 0; i < request.pros().size(); i++) {
            ReviewPro pro = new ReviewPro();
            pro.setReview(review);
            pro.setText(request.pros().get(i));
            pro.setPosition(i);
            review.getPros().add(pro);
        }

        for (int i = 0; i < request.cons().size(); i++) {
            ReviewCon con = new ReviewCon();
            con.setReview(review);
            con.setText(request.cons().get(i));
            con.setPosition(i);
            review.getCons().add(con);
        }

        int newCount = car.getReviewCount() + 1;
        BigDecimal newAverage = car.getAverageRating()
            .multiply(BigDecimal.valueOf(car.getReviewCount()))
            .add(BigDecimal.valueOf(request.rating()))
            .divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);
        car.setReviewCount(newCount);
        car.setAverageRating(newAverage);

        carRepository.save(car);
        reviewRepository.save(review);

        return ReviewMapper.toResponse(review, false);
    }

    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, Long publisherId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        Car car = review.getCar();

        if (!review.getPublisher().getId().equals(publisherId))
            throw new ForbiddenException("Unable to update review from another publisher");

        
        int oldRating = review.getRating();
        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setBody(request.body());
        
        review.getPros().clear();

        for (int i = 0; i < request.pros().size(); i++) {
            ReviewPro pro = new ReviewPro();
            pro.setReview(review);
            pro.setText(request.pros().get(i));
            pro.setPosition(i);
            review.getPros().add(pro);
        }

        review.getCons().clear();

        for (int i = 0; i < request.cons().size(); i++) {
            ReviewCon con = new ReviewCon();
            con.setReview(review);
            con.setText(request.cons().get(i));
            con.setPosition(i);
            review.getCons().add(con);
        }

        int reviewCount = car.getReviewCount();
        BigDecimal newAverage = car.getAverageRating()
            .multiply(BigDecimal.valueOf(reviewCount))
            .subtract(BigDecimal.valueOf(oldRating))
            .add(BigDecimal.valueOf(request.rating()))
            .divide(BigDecimal.valueOf(reviewCount), 2, RoundingMode.HALF_UP);
        car.setAverageRating(newAverage);
        
        carRepository.save(car);
        reviewRepository.save(review);

        return ReviewMapper.toResponse(review, false);
    }

    public void deleteReview(Long reviewId, Long callerId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!isAdmin && !review.getPublisher().getId().equals(callerId))
            throw new ForbiddenException("Unable to delete review from another publisher");

        Car car = review.getCar();
        int newCount = car.getReviewCount() - 1;
        car.setReviewCount(newCount);
        if (newCount == 0) {
            car.setAverageRating(BigDecimal.ZERO);
        } else {
        BigDecimal newAverage = car.getAverageRating()
            .multiply(BigDecimal.valueOf(newCount + 1))
            .subtract(BigDecimal.valueOf(review.getRating()))
            .divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);
        car.setAverageRating(newAverage);
        }

        carRepository.save(car);
        reviewRepository.delete(review);
    }

}
