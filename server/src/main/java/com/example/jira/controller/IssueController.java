package com.example.jira.controller;

import com.example.jira.dto.ApiResponse;
import com.example.jira.dto.CreateIssueRequest;
import com.example.jira.dto.UpdateIssueRequest;
import com.example.jira.model.Issue;
import com.example.jira.repository.IssueRepository;
import com.example.jira.repository.ProjectRepository;
import com.example.jira.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllIssues() {
        try {
            List<Issue> issues = issueRepository.findAllByOrderByCreatedAtDesc();
            Map<String, Object> data = new HashMap<>();
            data.put("issues", issues);
            return ResponseEntity.ok(ApiResponse.successWithCount(issues.size(), data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while fetching issues", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createIssue(@RequestBody CreateIssueRequest request) {
        try {
            if (request.getTitle() == null || request.getTitle().trim().isEmpty() ||
                request.getProjectId() == null || request.getProjectId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Title and projectId are required"));
            }

            Issue issue = new Issue();
            issue.setTitle(request.getTitle().trim());
            issue.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
            issue.setType(request.getType() != null ? request.getType() : "TASK");
            issue.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
            issue.setStatus("TODO");

            // Attach project reference
            String pId = request.getProjectId();
            projectRepository.findById(pId).ifPresentOrElse(
                p -> {
                    Map<String, Object> pMap = new HashMap<>();
                    pMap.put("_id", p.getId());
                    pMap.put("name", p.getName());
                    pMap.put("key", p.getKey());
                    issue.setProjectId(pMap);
                },
                () -> issue.setProjectId(pId)
            );

            // Attach assignee reference
            if (request.getAssignee() != null && !request.getAssignee().trim().isEmpty()) {
                String uId = request.getAssignee().trim();
                userRepository.findById(uId).ifPresentOrElse(
                    u -> {
                        Map<String, Object> uMap = new HashMap<>();
                        uMap.put("_id", u.getId());
                        uMap.put("name", u.getName());
                        uMap.put("email", u.getEmail());
                        issue.setAssignee(uMap);
                    },
                    () -> issue.setAssignee(uId)
                );
            }

            issue.setDueDate(request.getDueDate());
            Issue savedIssue = issueRepository.save(issue);

            Map<String, Object> data = new HashMap<>();
            data.put("issue", savedIssue);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Issue created successfully", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while creating issue", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateIssue(@PathVariable String id, @RequestBody UpdateIssueRequest request) {
        try {
            Optional<Issue> issueOpt = issueRepository.findById(id);
            if (issueOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Issue not found"));
            }

            Issue issue = issueOpt.get();

            if (request.getTitle() != null) {
                issue.setTitle(request.getTitle().trim());
            }
            if (request.getDescription() != null) {
                issue.setDescription(request.getDescription().trim());
            }
            if (request.getType() != null) {
                issue.setType(request.getType());
            }
            if (request.getPriority() != null) {
                issue.setPriority(request.getPriority());
            }
            if (request.getStatus() != null) {
                issue.setStatus(request.getStatus());
            }
            if (request.getDueDate() != null) {
                issue.setDueDate(request.getDueDate());
            }
            if (request.getAssignee() != null) {
                if (!request.getAssignee().trim().isEmpty()) {
                    String uId = request.getAssignee().trim();
                    userRepository.findById(uId).ifPresentOrElse(
                        u -> {
                            Map<String, Object> uMap = new HashMap<>();
                            uMap.put("_id", u.getId());
                            uMap.put("name", u.getName());
                            uMap.put("email", u.getEmail());
                            issue.setAssignee(uMap);
                        },
                        () -> issue.setAssignee(uId)
                    );
                } else {
                    issue.setAssignee(null);
                }
            }

            issue.setUpdatedAt(new Date());
            Issue updatedIssue = issueRepository.save(issue);

            Map<String, Object> data = new HashMap<>();
            data.put("issue", updatedIssue);

            return ResponseEntity.ok(ApiResponse.success("Issue updated successfully", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while updating issue", e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse> getIssuesByProject(@PathVariable String projectId) {
        try {
            List<Issue> issues = issueRepository.findByProjectId(projectId);
            Map<String, Object> data = new HashMap<>();
            data.put("issues", issues);
            return ResponseEntity.ok(ApiResponse.successWithCount(issues.size(), data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while fetching project issues", e.getMessage()));
        }
    }
}
