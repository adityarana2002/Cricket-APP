package com.cricketapp.controller;

import com.cricketapp.dto.CreateLocalMatchRequest;
import com.cricketapp.dto.LocalMatchResponseDTO;
import com.cricketapp.dto.UpdateScoreRequest;
import com.cricketapp.service.LocalMatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/local-matches")
@Slf4j
@RequiredArgsConstructor
public class LocalMatchController {

    private final LocalMatchService localMatchService;

    @PostMapping
    public ResponseEntity<?> createLocalMatch(
            @RequestBody CreateLocalMatchRequest request,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            LocalMatchResponseDTO response = localMatchService.createLocalMatch(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating local match: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllLocalMatches() {
        try {
            return ResponseEntity.ok(localMatchService.getAllLocalMatches());
        } catch (Exception e) {
            log.error("Error fetching all matches: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLocalMatch(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(localMatchService.getLocalMatch(id));
        } catch (Exception e) {
            log.error("Error fetching match {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/by-code/{matchCode}")
    public ResponseEntity<?> getLocalMatchByCode(@PathVariable String matchCode) {
        try {
            return ResponseEntity.ok(localMatchService.getLocalMatchByCode(matchCode));
        } catch (Exception e) {
            log.error("Error fetching match by code {}: {}", matchCode, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Match not found. Check the code and try again."));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getLocalMatchesByStatus(@PathVariable String status) {
        try {
            return ResponseEntity.ok(localMatchService.getLocalMatchesByStatus(status));
        } catch (Exception e) {
            log.error("Error fetching matches by status {}: {}", status, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> startMatch(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(localMatchService.startMatch(id, authentication.getName()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error starting match {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/score")
    public ResponseEntity<?> updateScore(
            @PathVariable Long id,
            @RequestBody UpdateScoreRequest request,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(localMatchService.updateScore(id, request, authentication.getName()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating score for match {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/switch-innings")
    public ResponseEntity<?> switchInnings(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(localMatchService.switchInnings(id, authentication.getName()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error switching innings for match {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<?> endMatch(
            @PathVariable Long id,
            @RequestParam(required = false) Long winnerTeamId,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(localMatchService.endMatch(id, winnerTeamId, authentication.getName()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error ending match {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMatch(@PathVariable Long id) {
        try {
            localMatchService.deleteMatch(id);
            return ResponseEntity.ok(Map.of("message", "Match deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting match {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
