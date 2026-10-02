package com.driveit.like.service;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;

import com.driveit.exception.ConflictException;
import com.driveit.exception.ForbiddenException;
import com.driveit.exception.ResourceNotFoundException;
import com.driveit.like.entity.ReviewLike;
import com.driveit.like.repository.LikeRepository;
import com.driveit.review.entity.Review;
import com.driveit.review.repository.ReviewRepository;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class LikeServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    
    @Mock
    private UserRepository userRepository;

    @Mock
    private LikeRepository likeRepository;

    @InjectMocks
    private LikeService likeService;

    @Test
    public void cannotLikeOwnReview() {
        // Arrange
        User user = new User();
        user.setId(1L);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
        Review review = new Review();
        review.setId(10L);
        review.setPublisher(user);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act & Assert
        assertThatThrownBy(() -> likeService.likeReview(review.getId(), user.getId()))
            .isInstanceOf(ForbiddenException.class);
    }

    @Test
    public void cannotLikeSameReviewTwice() {
        // Arrange
        User viewer = new User();
        User author = new User();
        viewer.setId(1L);
        author.setId(2L);
        Review review = new Review();
        review.setId(10L);
        review.setPublisher(author);
        
        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));
        when(userRepository.findById(viewer.getId())).thenReturn(Optional.of(viewer));
        when(likeRepository.existsByReviewIdAndUserId(review.getId(), viewer.getId())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> likeService.likeReview(review.getId(), viewer.getId()))
            .isInstanceOf(ConflictException.class);
    }

    @Test 
    public void likeReviewHappyPath() {
        // Arrange
        User viewer = new User();
        User author = new User();
        viewer.setId(1L);
        author.setId(2L);
        author.setTotalLikes(0);
        Review review = new Review();
        review.setId(10L);
        review.setPublisher(author);
        review.setLikeCount(0);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));
        when(userRepository.findById(viewer.getId())).thenReturn(Optional.of(viewer));
        when(likeRepository.existsByReviewIdAndUserId(review.getId(), viewer.getId())).thenReturn(false);

        // Act
        likeService.likeReview(review.getId(), viewer.getId());

        // Assert
        verify(likeRepository).save(any(ReviewLike.class));
        verify(reviewRepository).save(review);
        verify(userRepository).save(author);

        assertThat(review.getLikeCount()).isEqualTo(1);
        assertThat(author.getTotalLikes()).isEqualTo(1);
    }

    @Test 
    public void cannotUnlikeReviewNotLiked() {
        // Arrange
        User viewer = new User();
        User author = new User();
        viewer.setId(1L);
        author.setId(2L);
        Review review = new Review();
        review.setId(10L);
        review.setPublisher(author);
        
        when(likeRepository.findByReviewIdAndUserId(review.getId(), viewer.getId())).thenReturn(Optional.empty());
        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));

        // Act & Assert
        assertThatThrownBy(() -> likeService.unlikeReview(review.getId(), viewer.getId()))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test 
    public void unlikeReviewHappyPath() {
        // Arrange
        User viewer = new User();
        User author = new User();
        viewer.setId(1L);
        author.setId(2L);
        author.setTotalLikes(1);
        Review review = new Review();
        review.setId(10L);
        review.setPublisher(author);
        review.setLikeCount(1);
        ReviewLike like = new ReviewLike();
        like.setId(100L);
        like.setReview(review);
        like.setUser(viewer);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));
        when(likeRepository.findByReviewIdAndUserId(review.getId(), viewer.getId())).thenReturn(Optional.of(like));

        // Act
        likeService.unlikeReview(review.getId(), viewer.getId());

        // Assert
        verify(likeRepository).delete(like);
        verify(reviewRepository).save(review);
        verify(userRepository).save(author);

        assertThat(review.getLikeCount()).isEqualTo(0);
        assertThat(author.getTotalLikes()).isEqualTo(0);

    }

}
