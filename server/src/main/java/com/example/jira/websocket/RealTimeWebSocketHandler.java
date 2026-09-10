package com.example.jira.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Real-time WebSocket handler.
 *
 * Protocol: JSON messages. Each message must have at minimum:
 *   { "projectId": "...", ... }
 *
 * On receipt the server:
 *  1. Registers the session under its projectId
 *  2. Broadcasts the message to all other sessions in the same project
 *
 * This enables instant cross-user updates within a project.
 */
@Component
public class RealTimeWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    // projectId -> set of active WebSocket sessions
    private final Map<String, Set<WebSocketSession>> projectSessions = new ConcurrentHashMap<>();

    // sessionId -> projectId  (for cleanup on disconnect)
    private final Map<String, String> sessionProject = new ConcurrentHashMap<>();

    // ── Connection lifecycle ──────────────────────────────────────────────────

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // Session is registered when the first message arrives (we need projectId from payload)
        System.out.println("[WS] Connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = mapper.readValue(message.getPayload(), Map.class);

            String projectId = (String) payload.get("projectId");
            if (projectId == null || projectId.isBlank()) return;

            // Register this session under its project
            String prevProject = sessionProject.get(session.getId());
            if (!projectId.equals(prevProject)) {
                // Remove from old project if switching
                if (prevProject != null) {
                    Set<WebSocketSession> old = projectSessions.get(prevProject);
                    if (old != null) old.remove(session);
                }
                projectSessions.computeIfAbsent(projectId, k -> ConcurrentHashMap.newKeySet()).add(session);
                sessionProject.put(session.getId(), projectId);
            }

            // Broadcast to ALL other sessions in the same project
            String raw = message.getPayload();
            Set<WebSocketSession> peers = projectSessions.getOrDefault(projectId, Set.of());
            for (WebSocketSession peer : peers) {
                if (!peer.getId().equals(session.getId()) && peer.isOpen()) {
                    try {
                        peer.sendMessage(new TextMessage(raw));
                    } catch (IOException e) {
                        System.err.println("[WS] Failed to send to " + peer.getId() + ": " + e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("[WS] Error handling message: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String projectId = sessionProject.remove(session.getId());
        if (projectId != null) {
            Set<WebSocketSession> sessions = projectSessions.get(projectId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) projectSessions.remove(projectId);
            }
        }
        System.out.println("[WS] Disconnected: " + session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        System.err.println("[WS] Transport error on " + session.getId() + ": " + exception.getMessage());
    }

    // ── Server-side broadcast (called by IssueController) ────────────────────

    /**
     * Broadcast a typed event to all sessions in a project.
     * Called by IssueController after create/update operations.
     */
    public void broadcastToProject(String projectId, Object eventObject) {
        if (projectId == null) return;
        try {
            String json = mapper.writeValueAsString(eventObject);
            Set<WebSocketSession> sessions = projectSessions.getOrDefault(projectId, Set.of());
            for (WebSocketSession s : sessions) {
                if (s.isOpen()) {
                    try { s.sendMessage(new TextMessage(json)); }
                    catch (IOException e) { /* skip dead sessions */ }
                }
            }
        } catch (Exception e) {
            System.err.println("[WS] Broadcast error: " + e.getMessage());
        }
    }
}
