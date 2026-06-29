package com.cricketapp.controller;

import com.cricketapp.repository.MatchRepository;
import com.cricketapp.repository.PlayerRepository;
import com.cricketapp.repository.TournamentRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/stats")
@AllArgsConstructor
public class StatsController {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final TournamentRepository tournamentRepository;

    @GetMapping
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalMatches", matchRepository.count());
        stats.put("totalPlayers", playerRepository.count());
        stats.put("totalTournaments", tournamentRepository.count());
        return ResponseEntity.ok(stats);
    }
}
