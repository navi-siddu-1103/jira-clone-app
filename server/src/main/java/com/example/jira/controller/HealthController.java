package com.example.jira.controller;

import com.example.jira.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse> rootCheck() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Jira Clone API is running")
                .build());
    }

    @GetMapping("/api/health")
    public ResponseEntity<ApiResponse> healthCheck() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Backend is healthy")
                .build());
    }
}
