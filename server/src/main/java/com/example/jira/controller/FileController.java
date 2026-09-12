package com.example.jira.controller;

import com.example.jira.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

/**
 * REST API for file attachments on issues.
 *
 * Endpoints:
 *   POST   /api/files/upload/{issueId}          — Upload file (validates type/size)
 *   GET    /api/files/list/{issueId}             — List files for an issue
 *   GET    /api/files/download/{issueId}/{name}  — Download/view a file
 *   DELETE /api/files/{issueId}/{name}           — Delete a single file
 *   DELETE /api/files/issue/{issueId}            — Delete ALL files for an issue (on task delete)
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    // ── Upload ────────────────────────────────────────────────────────────────

    @PostMapping("/upload/{issueId}")
    public ResponseEntity<Map<String, Object>> upload(
            @PathVariable String issueId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "No file provided."));
        }

        try {
            Map<String, String> info = fileStorageService.store(file, issueId);
            Map<String, Object> resp = new HashMap<>(info);
            resp.put("success", true);
            resp.put("uploadedAt", new Date().toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Storage error: " + e.getMessage()));
        }
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @GetMapping("/list/{issueId}")
    public ResponseEntity<Map<String, Object>> list(@PathVariable String issueId) {
        try {
            List<Map<String, String>> files = fileStorageService.listForIssue(issueId);
            return ResponseEntity.ok(Map.of("success", true, "files", files, "count", files.size()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ── Download ──────────────────────────────────────────────────────────────

    @GetMapping("/download/{issueId}/{storedName}")
    public ResponseEntity<Resource> download(
            @PathVariable String issueId,
            @PathVariable String storedName) {

        try {
            Path filePath = fileStorageService.resolve(issueId, storedName);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = determineContentType(storedName);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + storedName + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ── Delete single file ────────────────────────────────────────────────────

    @DeleteMapping("/{issueId}/{storedName}")
    public ResponseEntity<Map<String, Object>> deleteFile(
            @PathVariable String issueId,
            @PathVariable String storedName) {

        try {
            fileStorageService.delete(issueId, storedName);
            return ResponseEntity.ok(Map.of("success", true, "deleted", storedName));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ── Delete all files for an issue ─────────────────────────────────────────

    @DeleteMapping("/issue/{issueId}")
    public ResponseEntity<Map<String, Object>> deleteAllForIssue(@PathVariable String issueId) {
        try {
            fileStorageService.deleteAllForIssue(issueId);
            return ResponseEntity.ok(Map.of("success", true, "issueId", issueId));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String determineContentType(String name) {
        String lower = name.toLowerCase();
        if (lower.endsWith(".pdf"))  return "application/pdf";
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        return "application/octet-stream";
    }
}
