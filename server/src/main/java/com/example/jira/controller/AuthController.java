package com.example.jira.controller;

import com.example.jira.dto.ApiResponse;
import com.example.jira.model.User;
import com.example.jira.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody User user) {
        try {
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User with this email already exists"));
            }

            User savedUser = userRepository.save(user);
            Map<String, Object> data = new HashMap<>();
            data.put("user", new User(savedUser.getId(), savedUser.getName(), savedUser.getEmail()));
            data.put("token", "sample-jwt-token");

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error during registration", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody User user) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(user.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid email or password"));
            }

            User existingUser = userOpt.get();
            Map<String, Object> data = new HashMap<>();
            data.put("user", new User(existingUser.getId(), existingUser.getName(), existingUser.getEmail()));
            data.put("token", "sample-jwt-token");

            return ResponseEntity.ok(ApiResponse.success("Login successful", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error during login", e.getMessage()));
        }
    }
}
