package com.example.jira.controller;

import com.example.jira.dto.ApiResponse;
import com.example.jira.dto.CreateIssueRequest;
import com.example.jira.dto.UpdateIssueRequest;
import com.example.jira.repository.ProjectRepository;
import com.example.jira.repository.UserRepository;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllIssues() {
        try {
            List<Map<String, Object>> resultList = new ArrayList<>();
            List<Document> documents = mongoTemplate.findAll(Document.class, "issues");

            for (Document doc : documents) {
                Map<String, Object> map = convertDocumentToMap(doc);
                resultList.add(map);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("issues", resultList);
            return ResponseEntity.ok(ApiResponse.successWithCount(resultList.size(), data));
        } catch (Exception e) {
            e.printStackTrace();
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

            Document doc = new Document();
            doc.put("title", request.getTitle().trim());
            doc.put("description", request.getDescription() != null ? request.getDescription().trim() : "");
            doc.put("type", request.getType() != null ? request.getType() : "TASK");
            doc.put("priority", request.getPriority() != null ? request.getPriority() : "MEDIUM");
            doc.put("status", "TODO");

            // Attach project reference
            String pId = request.getProjectId();
            projectRepository.findById(pId).ifPresentOrElse(
                p -> {
                    Map<String, Object> pMap = new HashMap<>();
                    pMap.put("_id", p.getId());
                    pMap.put("name", p.getName());
                    pMap.put("key", p.getKey());
                    doc.put("projectId", pMap);
                },
                () -> doc.put("projectId", pId)
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
                        doc.put("assignee", uMap);
                    },
                    () -> doc.put("assignee", uId)
                );
            }

            doc.put("dueDate", request.getDueDate());
            doc.put("createdAt", new Date());
            doc.put("updatedAt", new Date());

            mongoTemplate.save(doc, "issues");

            Map<String, Object> map = convertDocumentToMap(doc);
            Map<String, Object> data = new HashMap<>();
            data.put("issue", map);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Issue created successfully", data));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while creating issue", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateIssue(@PathVariable String id, @RequestBody UpdateIssueRequest request) {
        try {
            Document doc = null;
            if (ObjectId.isValid(id)) {
                doc = mongoTemplate.findById(new ObjectId(id), Document.class, "issues");
            }
            if (doc == null) {
                doc = mongoTemplate.findById(id, Document.class, "issues");
            }

            if (doc == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Issue not found"));
            }

            if (request.getTitle() != null) {
                doc.put("title", request.getTitle().trim());
            }
            if (request.getDescription() != null) {
                doc.put("description", request.getDescription().trim());
            }
            if (request.getType() != null) {
                doc.put("type", request.getType());
            }
            if (request.getPriority() != null) {
                doc.put("priority", request.getPriority());
            }
            if (request.getStatus() != null) {
                doc.put("status", request.getStatus());
            }
            if (request.getDueDate() != null) {
                doc.put("dueDate", request.getDueDate());
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
                            doc.put("assignee", uMap);
                        },
                        () -> doc.put("assignee", uId)
                    );
                } else {
                    doc.put("assignee", null);
                }
            }

            doc.put("updatedAt", new Date());
            mongoTemplate.save(doc, "issues");

            Map<String, Object> map = convertDocumentToMap(doc);
            Map<String, Object> data = new HashMap<>();
            data.put("issue", map);

            return ResponseEntity.ok(ApiResponse.success("Issue updated successfully", data));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while updating issue", e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse> getIssuesByProject(@PathVariable String projectId) {
        try {
            List<Map<String, Object>> resultList = new ArrayList<>();
            List<Document> documents = mongoTemplate.findAll(Document.class, "issues");

            for (Document doc : documents) {
                Object pIdObj = doc.get("projectId");
                boolean matches = false;
                if (pIdObj instanceof Document) {
                    Object nestedId = ((Document) pIdObj).get("_id");
                    if (nestedId != null && nestedId.toString().equals(projectId)) {
                        matches = true;
                    }
                } else if (pIdObj != null && pIdObj.toString().equals(projectId)) {
                    matches = true;
                }

                if (matches) {
                    resultList.add(convertDocumentToMap(doc));
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("issues", resultList);
            return ResponseEntity.ok(ApiResponse.successWithCount(resultList.size(), data));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error while fetching project issues", e.getMessage()));
        }
    }

    private Map<String, Object> convertDocumentToMap(Document doc) {
        Map<String, Object> map = new HashMap<>(doc);
        Object idObj = map.get("_id");
        if (idObj != null) {
            map.put("_id", idObj.toString());
            map.put("id", idObj.toString());
        }
        return map;
    }
}
