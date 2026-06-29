package com.cricketapp.controller;

import com.cricketapp.dto.CreatePlayerRequest;
import com.cricketapp.dto.PlayerResponseDTO;
import com.cricketapp.service.PlayerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/players")
@Slf4j
@CrossOrigin("http://localhost:3000")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @PostMapping
    public ResponseEntity<PlayerResponseDTO> createPlayer(
            @RequestBody CreatePlayerRequest request,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        try {
            String userEmail = authentication.getName();
            log.info("Creating player request from user: {}", userEmail);
            PlayerResponseDTO response = playerService.createPlayer(request, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating player: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerResponseDTO> getPlayer(@PathVariable Long id) {
        try {
            PlayerResponseDTO response = playerService.getPlayer(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching player: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PlayerResponseDTO>> getAllPlayers() {
        try {
            List<PlayerResponseDTO> players = playerService.getAllPlayers();
            return ResponseEntity.ok(players);
        } catch (Exception e) {
            log.error("Error fetching all players: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<PlayerResponseDTO>> getPlayersByTeam(@PathVariable Long teamId) {
        try {
            List<PlayerResponseDTO> players = playerService.getPlayersByTeam(teamId);
            return ResponseEntity.ok(players);
        } catch (Exception e) {
            log.error("Error fetching players by team: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<PlayerResponseDTO>> getPlayersByRole(@PathVariable String role) {
        try {
            List<PlayerResponseDTO> players = playerService.getPlayersByRole(role);
            return ResponseEntity.ok(players);
        } catch (Exception e) {
            log.error("Error fetching players by role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerResponseDTO> updatePlayer(
            @PathVariable Long id,
            @RequestBody CreatePlayerRequest request) {
        try {
            PlayerResponseDTO response = playerService.updatePlayer(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating player: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        try {
            playerService.deletePlayer(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting player: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<PlayerResponseDTO> activatePlayer(@PathVariable Long id) {
        try {
            PlayerResponseDTO response = playerService.activatePlayer(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error activating player: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<PlayerResponseDTO> deactivatePlayer(@PathVariable Long id) {
        try {
            PlayerResponseDTO response = playerService.deactivatePlayer(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deactivating player: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
