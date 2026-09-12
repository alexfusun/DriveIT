package com.driveit.publisher.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.driveit.common.PageResponse;
import com.driveit.publisher.dto.PublisherResponse;
import com.driveit.publisher.service.PublisherService;
import com.driveit.review.dto.ReviewPageResponse;
import com.driveit.user.entity.PublisherRank;

import lombok.RequiredArgsConstructor;

@RestController 
@RequiredArgsConstructor 
public class PublisherController {

    private final PublisherService publisherService;

    @GetMapping("/api/v1/publishers")
    public ResponseEntity<PageResponse<PublisherResponse>> getPublishers(@RequestParam(required = false) PublisherRank rank,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size) {
        PageResponse<PublisherResponse> result = publisherService.getPublishers(rank, page, size);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/api/v1/publishers/{id}")
    public ResponseEntity<PublisherResponse> getPublisherById(@PathVariable Long id) {
        PublisherResponse result = publisherService.getPublisherById(id);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/api/v1/publishers/{id}/reviews")
    public ResponseEntity<ReviewPageResponse> getPublisherReviews(@PathVariable Long id,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size,
                                                                @RequestParam(defaultValue = "createdAt,desc") String sort) {
        ReviewPageResponse result = publisherService.getPublisherReviews(id, page, size, sort);
    
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

}
