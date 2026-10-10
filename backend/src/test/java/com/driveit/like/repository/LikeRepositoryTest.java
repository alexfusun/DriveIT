package com.driveit.like.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.driveit.brand.entity.Brand;
import com.driveit.brand.entity.CarModel;
import com.driveit.brand.repository.BrandRepository;
import com.driveit.brand.repository.CarModelRepository;
import com.driveit.car.entity.Car;
import com.driveit.car.repository.CarRepository;
import com.driveit.like.entity.ReviewLike;
import com.driveit.review.entity.Review;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

@DataJpaTest 
@Testcontainers 
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class LikeRepositoryTest {

    @Container 
    @ServiceConnection 
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired 
    private BrandRepository brandRepository;

    @Autowired 
    private CarModelRepository carModelRepository;

    @Autowired 
    private CarRepository carRepository;

    @Autowired 
    private UserRepository userRepository;

    @Autowired 
    private ReviewRepository reviewRepository;

    @Autowired 
    private LikeRepository likeRepository;

    @Test 
    public void findLikeReviewIdsReturnsOnlyReviewsLikedByThatUser() {
        // Arrange
        Brand brand = new Brand();
        brand.setName("Honda");
        brandRepository.save(brand);

        CarModel carModel = new CarModel();
        carModel.setBrand(brand);
        carModel.setName("Civic");
        carModelRepository.save(carModel);

        Car car = new Car();
        car.setBrand(brand);
        car.setCarModel(carModel);
        car.setVersion("FL4");
        car.setYear(2024);
        car.setPrice(BigDecimal.valueOf(36990));
        carRepository.save(car);

        User user1 = new User();
        user1.setEmail("bob@email.net");
        user1.setPasswordHash("SomePassword");
        user1.setRole(Role.PUBLISHER);
        user1.setUsername("Bob");
        userRepository.save(user1);
        User user2 = new User();
        user2.setEmail("alice@email.net");
        user2.setPasswordHash("AnotherPassword");
        user2.setRole(Role.PUBLISHER);
        user2.setUsername("Alice");
        userRepository.save(user2);

        Review review1 = new Review();
        review1.setPublisher(user1);
        review1.setRating(5);
        review1.setTitle("Honda Civic Review");
        review1.setBody("Content");
        review1.setCar(car);
        reviewRepository.save(review1);
        Review review2 = new Review();
        review2.setPublisher(user2);
        review2.setRating(3);
        review2.setTitle("Trying out the Honda Civic");
        review2.setBody("Other content");
        review2.setCar(car);
        reviewRepository.save(review2);

        ReviewLike reviewLike = new ReviewLike();
        reviewLike.setReview(review1);
        reviewLike.setUser(user2);
        likeRepository.save(reviewLike);

        // Act
        List<Long> result = likeRepository.findLikedReviewIds(user2.getId(), List.of(review1.getId(), review2.getId()));

        // Assert
        assertThat(result).containsExactly(review1.getId());
    }
    
}
