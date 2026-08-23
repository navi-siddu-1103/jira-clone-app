package com.example.jira.controller;

import com.example.jira.dto.ApiResponse;
import com.example.jira.model.Project;
import com.example.jira.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllProjects() {
        try {
            List<Project> projects = projectRepository.findAll();
            Map<String, Object> data = new HashMap<>();
            data.put("projects", projects);
            return ResponseEntity.ok(ApiResponse.successWithCount(projects.size(), data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while fetching projects", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createProject(@RequestBody Project project) {
        try {
            Project saved = projectRepository.save(project);
            Map<String, Object> data = new HashMap<>();
            data.put("project", saved);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Project created successfully", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while creating project", e.getMessage()));
        }
    }
}
