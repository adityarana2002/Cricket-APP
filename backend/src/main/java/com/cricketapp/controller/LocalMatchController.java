package com.cricketapp.controller;

import com.cricketapp.dto.CreateLocalMatchRequest;
import com.cricketapp.dto.LocalMatchResponseDTO;
import com.cricketapp.dto.ScoreStateRequest;
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

    /**
     * The caller's own matches — this list is their private history. Other
     * users' matches are reachable only through {@link #getLocalMatchByCode}.
     */
    @GetMapping
    public ResponseEntity<?> getMyLocalMatches(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(localMatchService.getMyLocalMatches(authentication.getName()));
        } catch (Exception e) {
            log.error("Error fetching matches for {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLocalMatch(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(localMatchService.getOwnedLocalMatch(id, authentication.getName()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching match {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * The one spectator entry point: anyone holding a match code may watch that
     * match, which is why this endpoint is deliberately not owner-scoped.
     */
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
    public ResponseEntity<?> getMyLocalMatchesByStatus(@PathVariable String status, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(localMatchService.getMyLocalMatchesByStatus(status, authentication.getName()));
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

    /**
     * Scorecard snapshot from the scoring client. Separate from /score so that a
     * snapshot failure never blocks the actual score update.
     */
    @PutMapping("/{id}/score-state")
    public ResponseEntity<?> saveScoreState(
            @PathVariable Long id,
            @RequestBody ScoreStateRequest request,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            localMatchService.saveScoreState(id, request.getState(), authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Score state saved"));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error saving score state for match {}: {}", id, e.getMessage());
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
    public ResponseEntity<Map<String, String>> deleteMatch(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            localMatchService.deleteMatch(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Match deleted successfully"));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting match {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
