package com.example.jira.controller;

import com.example.jira.dto.ApiResponse;
import com.example.jira.model.User;
import com.example.jira.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
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
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required"));
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Password is required"));
            }

            if (userRepository.findByEmail(user.getEmail().trim()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User with this email already exists"));
            }

            // Ensure timestamps and role are set
            user.setEmail(user.getEmail().trim());
            if (user.getRole() == null) user.setRole("USER");
            user.setCreatedAt(new Date());
            user.setUpdatedAt(new Date());

            User savedUser = userRepository.save(user);

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("name", savedUser.getName());
            userData.put("email", savedUser.getEmail());
            userData.put("group", savedUser.getGroup());
            userData.put("role", savedUser.getRole());

            Map<String, Object> data = new HashMap<>();
            data.put("user", userData);
            data.put("token", "sample-jwt-token-" + savedUser.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", data));

        } catch (Exception e) {
            System.err.println("Registration error: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error during registration: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody User user) {
        try {
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required"));
            }

            Optional<User> userOpt = userRepository.findByEmail(user.getEmail().trim());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid email or password"));
            }

            User existingUser = userOpt.get();

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", existingUser.getId());
            userData.put("name", existingUser.getName());
            userData.put("email", existingUser.getEmail());
            userData.put("group", existingUser.getGroup());
            userData.put("role", existingUser.getRole());

            Map<String, Object> data = new HashMap<>();
            data.put("user", userData);
            data.put("token", "sample-jwt-token-" + existingUser.getId());

            return ResponseEntity.ok(ApiResponse.success("Login successful", data));

        } catch (Exception e) {
            System.err.println("Login error: " + e.getClass().getName() + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error during login: " + e.getMessage()));
        }
    }
}
