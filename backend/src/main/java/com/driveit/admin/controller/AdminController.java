package com.driveit.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.driveit.admin.dto.AdminUserResponse;
import com.driveit.admin.dto.RankUpdateRequest;
import com.driveit.admin.dto.RankUpdateResponse;
import com.driveit.admin.dto.RoleUpdateRequest;
import com.driveit.admin.service.AdminService;
import com.driveit.common.PageResponse;
import com.driveit.user.entity.Role;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequiredArgsConstructor 
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/api/v1/admin/users")
    public ResponseEntity<PageResponse<AdminUserResponse>> getUsers(@RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size,
                                                                        @RequestParam(required = false) Role role,
                                                                        @RequestParam(required = false) String search
    ) {
        PageResponse<AdminUserResponse> result = adminService.getUsers(role, search, page, size);

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @PatchMapping("/api/v1/admin/users/{id}/role")
    public ResponseEntity<AdminUserResponse> changeUserRole(@PathVariable Long id, @RequestBody @Valid RoleUpdateRequest request) {
        AdminUserResponse result = adminService.changeUserRole(id, request.role());

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @PatchMapping("/api/v1/admin/publishers/{id}/rank")
    public ResponseEntity<RankUpdateResponse> changeUserRank(@PathVariable Long id, @RequestBody @Valid RankUpdateRequest request) {
        RankUpdateResponse result = adminService.changeUserRank(id, request.rank());

        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

}
