package com.cricketapp.controller;

import com.cricketapp.dto.CreateTournamentRequest;
import com.cricketapp.dto.TournamentResponseDTO;
import com.cricketapp.service.TournamentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tournaments")
@AllArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @PostMapping
    public ResponseEntity<TournamentResponseDTO> createTournament(
            @RequestBody CreateTournamentRequest request,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        String email = authentication.getName();
        TournamentResponseDTO tournament = tournamentService.createTournament(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(tournament);
    }

    @GetMapping
    public ResponseEntity<List<TournamentResponseDTO>> getAllTournaments() {
        List<TournamentResponseDTO> tournaments = tournamentService.getAllTournaments();
        return ResponseEntity.ok(tournaments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentResponseDTO> getTournament(@PathVariable Long id) {
        TournamentResponseDTO tournament = tournamentService.getTournament(id);
        return ResponseEntity.ok(tournament);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TournamentResponseDTO>> getTournamentsByStatus(@PathVariable String status) {
        List<TournamentResponseDTO> tournaments = tournamentService.getTournamentsByStatus(status);
        return ResponseEntity.ok(tournaments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TournamentResponseDTO> updateTournament(
            @PathVariable Long id,
            @RequestBody CreateTournamentRequest request) {
        TournamentResponseDTO tournament = tournamentService.updateTournament(id, request);
        return ResponseEntity.ok(tournament);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTournament(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok("Tournament deleted successfully");
    }
}
