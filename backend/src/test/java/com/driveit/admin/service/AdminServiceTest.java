package com.driveit.admin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.driveit.exception.BadRequestException;
import com.driveit.user.entity.PublisherRank;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock 
    private UserRepository userRepository;

    @InjectMocks 
    private AdminService adminService;

    @Test 
    public void cannotChangeUserRoleToAdmin() {
        // Arrange
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        // Act & Assert
        assertThatThrownBy(() -> adminService.changeUserRole(user.getId(), Role.ADMIN))
            .isInstanceOf(BadRequestException.class);
    }

    @Test 
    public void promotingUserToPublisherSetsRankBronze() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setRole(Role.USER);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        // Act
        adminService.changeUserRole(user.getId(), Role.PUBLISHER);

        // Assert
        verify(userRepository).save(user);
        assertThat(user.getRank()).isEqualTo(PublisherRank.BRONZE);
    }

    @Test 
    public void demotingPublisherToUserSetsRankNull() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setRole(Role.PUBLISHER);
        user.setRank(PublisherRank.BRONZE);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        // Act
        adminService.changeUserRole(user.getId(), Role.USER);

        // Assert
        verify(userRepository).save(user);
        assertThat(user.getRank()).isEqualTo(null);
    }

    @Test 
    public void cannotChangeUserRankToNonPublisher() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setRole(Role.USER);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        // Act & Assert
        assertThatThrownBy(() -> adminService.changeUserRank(user.getId(), PublisherRank.GOLD))
            .isInstanceOf(BadRequestException.class);
    }

    @Test 
    public void changeUserRankHappyPath() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setRole(Role.PUBLISHER);
        user.setRank(PublisherRank.BRONZE);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        // Act
        adminService.changeUserRank(user.getId(), PublisherRank.GOLD);

        // Assert
        verify(userRepository).save(user);
        assertThat(user.getRank()).isEqualTo(PublisherRank.GOLD);
    }
    
}
