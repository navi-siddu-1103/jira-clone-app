package com.example.jira.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles email notification requests from the frontend.
 * Only sends email if JavaMailSender is configured (spring.mail.* env vars set).
 * If not configured, returns 200 with a "skipped" message so frontend doesn't crash.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @PostMapping("/email")
    public ResponseEntity<Map<String, Object>> sendEmail(@RequestBody Map<String, String> body) {
        String to      = body.getOrDefault("to", "");
        String subject = body.getOrDefault("subject", "Jira Clone Notification");
        String message = body.getOrDefault("body", "");
        String type    = body.getOrDefault("type", "GENERAL");

        if (to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "No recipient email"));
        }

        if (mailSender == null) {
            // Email not configured — log and return graceful skip
            System.out.printf("[Email Notification] SKIPPED (no mail config) | Type: %s | To: %s | Subject: %s%n", type, to, subject);
            return ResponseEntity.ok(Map.of("success", true, "skipped", true, "reason", "Email server not configured"));
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject("[Jira Clone] " + subject);
            mail.setText(message + "\n\n---\nThis is an automated notification from Jira Clone.\nYou can manage your notification preferences in Settings.");
            mailSender.send(mail);
            System.out.printf("[Email Notification] SENT | Type: %s | To: %s%n", type, to);
            return ResponseEntity.ok(Map.of("success", true, "skipped", false));
        } catch (Exception e) {
            System.err.println("[Email Notification] FAILED: " + e.getMessage());
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
