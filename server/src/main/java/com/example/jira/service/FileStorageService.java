package com.example.jira.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * Handles secure file storage on disk.
 * Files are stored under ${file.upload.dir} (default: uploads/).
 * Each file gets a UUID-based unique filename to prevent duplication.
 */
@Service
public class FileStorageService {

    private final Path uploadRoot;

    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".png", ".jpg", ".jpeg", ".docx", ".doc");

    public FileStorageService(@Value("${file.upload.dir:uploads}") String uploadDir) throws IOException {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadRoot);
    }

    public Map<String, String> store(MultipartFile file, String issueId) throws IOException {
        // ── 1. Type validation ──
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported file type: " + contentType + ". Allowed: PDF, PNG, JPG, DOCX.");
        }

        // ── 2. Extension validation ──
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase()
                : "";
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Unsupported file extension: " + ext + ". Allowed: .pdf, .png, .jpg, .docx");
        }

        // ── 3. Size validation ──
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds 10MB limit (size: " + (file.getSize() / 1024 / 1024) + "MB).");
        }

        // ── 4. Store with UUID name (prevents duplication) ──
        // Directory per issue for easy cleanup on task delete
        Path issueDir = uploadRoot.resolve(issueId).normalize();
        Files.createDirectories(issueDir);

        String uniqueName = UUID.randomUUID() + ext;
        Path dest = issueDir.resolve(uniqueName);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        Map<String, String> info = new LinkedHashMap<>();
        info.put("originalName", originalName);
        info.put("storedName", uniqueName);
        info.put("size", String.valueOf(file.getSize()));
        info.put("contentType", contentType);
        info.put("issueId", issueId);
        info.put("path", issueId + "/" + uniqueName);
        return info;
    }

    public Path resolve(String issueId, String storedName) {
        return uploadRoot.resolve(issueId).resolve(storedName).normalize();
    }

    public void delete(String issueId, String storedName) throws IOException {
        Path target = resolve(issueId, storedName);
        Files.deleteIfExists(target);
    }

    /** Delete all files for a given issue (called when task is deleted) */
    public void deleteAllForIssue(String issueId) throws IOException {
        Path issueDir = uploadRoot.resolve(issueId).normalize();
        if (Files.exists(issueDir)) {
            try (var stream = Files.walk(issueDir)) {
                stream.sorted(Comparator.reverseOrder())
                      .forEach(p -> { try { Files.delete(p); } catch (IOException ignored) {} });
            }
        }
    }

    /** List all files for an issue */
    public List<Map<String, String>> listForIssue(String issueId) throws IOException {
        Path issueDir = uploadRoot.resolve(issueId).normalize();
        List<Map<String, String>> result = new ArrayList<>();
        if (!Files.exists(issueDir)) return result;
        try (var stream = Files.list(issueDir)) {
            stream.filter(Files::isRegularFile).forEach(p -> {
                Map<String, String> info = new LinkedHashMap<>();
                String name = p.getFileName().toString();
                info.put("storedName", name);
                info.put("issueId", issueId);
                try { info.put("size", String.valueOf(Files.size(p))); } catch (IOException e) { info.put("size", "0"); }
                result.add(info);
            });
        }
        return result;
    }
}
