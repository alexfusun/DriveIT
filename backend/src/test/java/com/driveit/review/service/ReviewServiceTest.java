package com.driveit.review.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.driveit.car.entity.Car;
import com.driveit.car.repository.CarRepository;
import com.driveit.exception.ConflictException;
import com.driveit.exception.ForbiddenException;
import com.driveit.like.repository.LikeRepository;
import com.driveit.review.dto.ReviewRequest;
import com.driveit.review.entity.Review;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock 
    private CarRepository carRepository;

    @Mock 
    private ReviewRepository reviewRepository;

    @Mock 
    private UserRepository userRepository;

    @Mock
    private LikeRepository likeRepository;

    @InjectMocks 
    private ReviewService reviewService;

    @Test 
    public void cannotCreateTwoReviewsSameCarAndPublisher() {
        // Arrange
        User user = new User();
        user.setId(1L);
        Car car = new Car();
        car.setId(10L);

        when(carRepository.findById(car.getId())).thenReturn(Optional.of(car));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(reviewRepository.existsByCarIdAndPublisherId(car.getId(), user.getId())).thenReturn(true);

        // Act
        assertThatThrownBy(() -> reviewService.createReview(car.getId(), null, user.getId()))
            .isInstanceOf(ConflictException.class);
    }

    @Test 
    public void createReviewHappyPath() {
        User user = new User();
        user.setId(1L);
        user.setReviewCount(1);
        Car car = new Car();
        car.setId(10L);
        car.setReviewCount(2);
        car.setAverageRating(BigDecimal.valueOf(4));

        ReviewRequest request = new ReviewRequest(5, "Review Title", "Review Body", List.of(), List.of());

        when(carRepository.findById(car.getId())).thenReturn(Optional.of(car));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(reviewRepository.existsByCarIdAndPublisherId(car.getId(), user.getId())).thenReturn(false);

        // Act
        reviewService.createReview(car.getId(), request, user.getId());

        // Assert
        verify(carRepository).save(car);
        verify(userRepository).save(user);
        verify(reviewRepository).save(any(Review.class));

        int expectedReviewCount = 3;
        int expectedUserReviewCount = 2;
        BigDecimal expectedAverageRating = new BigDecimal("4.33");

        assertThat(user.getReviewCount()).isEqualTo(expectedUserReviewCount);
        assertThat(car.getReviewCount()).isEqualTo(expectedReviewCount);
        assertThat(car.getAverageRating()).isEqualByComparingTo(expectedAverageRating);
    }

    @Test
    public void cannotUpdateReviewFromAnotherPublisher() {
        // Arrange
        User user1 = new User();
        User user2 = new User();
        user1.setId(1L);
        user2.setId(2L);
        Review review = new Review();
        review.setId(10L);
        review.setPublisher(user1);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act & Assert
        assertThatThrownBy(() -> reviewService.updateReview(review.getId(), null, user2.getId()))
            .isInstanceOf(ForbiddenException.class);
    }

    @Test 
    public void updateReviewHappyPath() {
        User user = new User();
        user.setId(1L);
        Car car = new Car();
        car.setId(10L);
        car.setReviewCount(2);
        car.setAverageRating(BigDecimal.valueOf(4));
        Review review = new Review();
        review.setRating(4);
        review.setCar(car);
        review.setPublisher(user);

        ReviewRequest request = new ReviewRequest(1, "Review Title", "Review Body", List.of(), List.of());

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act
        reviewService.updateReview(review.getId(), request, user.getId());

        // Assert
        verify(carRepository).save(car);
        verify(reviewRepository).save(any(Review.class));

        BigDecimal expectedAverageRating = new BigDecimal("2.5");

        assertThat(car.getAverageRating()).isEqualByComparingTo(expectedAverageRating);
    }

    @Test
    public void cannotDeleteReviewFromAnotherPublisherIfNotAdmin() {
        // Arrange
        User user1 = new User();
        User user2 = new User();
        user1.setId(1L);
        user2.setId(2L);
        Review review = new Review();
        review.setPublisher(user1);
        review.setId(10L);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act & Assert
        assertThatThrownBy(() -> reviewService.deleteReview(review.getId(), user2.getId(), false)).
            isInstanceOf(ForbiddenException.class);
    }

    @Test 
    public void adminCanDeleteAnyReview() {
        // Arrange
        User user1 = new User();
        User user2 = new User();
        user1.setId(1L);
        user2.setId(2L);
        Car car = new Car();
        car.setReviewCount(2);
        Review review = new Review();
        review.setPublisher(user1);
        review.setId(10L);
        review.setCar(car);


        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act
        reviewService.deleteReview(review.getId(), user2.getId(), true);

        // Assert
        verify(reviewRepository).delete(review);
    }

    @Test 
    public void deleteReviewHappyPath() {
        User user = new User();
        user.setId(1L);
        Car car = new Car();
        car.setId(10L);
        car.setReviewCount(2);
        car.setAverageRating(BigDecimal.valueOf(4));
        Review review = new Review();
        review.setCar(car);
        review.setPublisher(user);
        review.setRating(5);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act
        reviewService.deleteReview(review.getId(), user.getId(), false);

        // Assert
        verify(reviewRepository).delete(review);
        verify(carRepository).save(car);
        verify(userRepository).save(user);

        BigDecimal expectedAverageRating = new BigDecimal("3");
        int expectedReviewCount = 1;

        assertThat(car.getAverageRating()).isEqualByComparingTo(expectedAverageRating);
        assertThat(car.getReviewCount()).isEqualTo(expectedReviewCount);
    }

    @Test
    public void lastReviewDeleted() {
        User user = new User();
        user.setId(1L);
        Car car = new Car();
        car.setId(10L);
        car.setReviewCount(1);
        car.setAverageRating(BigDecimal.valueOf(5));
        Review review = new Review();
        review.setCar(car);
        review.setPublisher(user);
        review.setRating(5);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act
        reviewService.deleteReview(review.getId(), user.getId(), false);

        // Assert
        verify(reviewRepository).delete(review);
        verify(carRepository).save(car);
        verify(userRepository).save(user);

        BigDecimal expectedAverageRating = BigDecimal.ZERO;
        int expectedReviewCount = 0;

        assertThat(car.getAverageRating()).isEqualByComparingTo(expectedAverageRating);
        assertThat(car.getReviewCount()).isEqualTo(expectedReviewCount);
    }
    
}
