package com.driveit.auth.config;


import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.driveit.auth.security.JwtUtil;
import com.driveit.user.entity.Role;
import com.driveit.user.entity.User;
import com.driveit.user.repository.UserRepository;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers 
public class SecurityConfigTest {

    @Container 
    @ServiceConnection 
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @LocalServerPort 
    private int port;

    @Autowired 
    private TestRestTemplate restTemplate;

    @Autowired 
    private JwtUtil jwtUtil;

    @Autowired 
    private UserRepository userRepository;

    @Test 
    public void publisherHittingAdminRouteGets403NotAuthorized() {
        // Arrange
        User user = new User();
        user.setEmail("bob@email.com");
        user.setUsername("Bob");
        user.setPasswordHash("SomePassword");
        user.setRole(Role.PUBLISHER);
        userRepository.save(user);

        String jwtToken = jwtUtil.generateToken(user.getEmail());
    
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
            "http://localhost:" + port + "/api/v1/admin/users",
            HttpMethod.GET,
            entity,
            String.class
        );

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
    
}
