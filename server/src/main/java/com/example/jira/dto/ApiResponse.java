package com.example.jira.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {
    private Boolean success;
    private String message;
    private Integer count;
    private Map<String, Object> data;
    private String error;

    public static ApiResponse success(String message, Map<String, Object> data) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static ApiResponse successWithCount(int count, Map<String, Object> data) {
        return ApiResponse.builder()
                .success(true)
                .count(count)
                .data(data)
                .build();
    }

    public static ApiResponse error(String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

    public static ApiResponse error(String message, String errorDetail) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .error(errorDetail)
                .build();
    }
}
