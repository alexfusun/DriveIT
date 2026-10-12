package com.driveit.review.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.driveit.brand.entity.Brand;
import com.driveit.brand.entity.CarModel;
import com.driveit.brand.repository.BrandRepository;
import com.driveit.brand.repository.CarModelRepository;
import com.driveit.car.entity.Car;
import com.driveit.car.repository.CarRepository;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.review.entity.Review;
import com.driveit.review.entity.ReviewCon;
import com.driveit.review.entity.ReviewPro;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

@Import(ReviewService.class)
@DataJpaTest 
@Testcontainers 
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class ReviewServiceIntegrationTest {

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
    private ReviewService reviewService;

    @Test 
    public void getReviewsReturnsReviewWithProsAndCons() {
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

        User user = new User();
        user.setEmail("bob@email.net");
        user.setPasswordHash("SomePassword");
        user.setRole(Role.PUBLISHER);
        user.setUsername("Bob");
        userRepository.save(user);

        Review review = new Review();
        review.setPublisher(user);
        review.setRating(5);
        review.setTitle("Honda Civic Review");
        review.setBody("Content");
        review.setCar(car);
        ReviewPro pro = new ReviewPro();
        pro.setText("Reliable");
        pro.setPosition(0);
        pro.setReview(review);
        ReviewCon con = new ReviewCon();
        con.setText("Higher price");
        con.setPosition(0);
        con.setReview(review);
        List<ReviewPro> pros = new ArrayList<>();
        pros.add(pro);
        review.setPros(pros);
        List<ReviewCon> cons = new ArrayList<>();
        cons.add(con);
        review.setCons(cons);
        
        reviewRepository.save(review);

        // Act
        ReviewPageResponse result = reviewService.getReviews(car.getId(), 0, 10, "createdAt,desc", user.getId());

        // Assert
        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).pros()).containsExactly("Reliable");
        assertThat(result.content().get(0).cons()).containsExactly("Higher price");
    }
    
}
