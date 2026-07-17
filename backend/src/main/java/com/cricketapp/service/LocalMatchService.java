package com.cricketapp.service;

import com.cricketapp.dto.CreateLocalMatchRequest;
import com.cricketapp.dto.LocalMatchResponseDTO;
import com.cricketapp.dto.UpdateScoreRequest;
import com.cricketapp.entity.*;
import com.cricketapp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class LocalMatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 7;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private String generateUniqueMatchCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_CHARS.charAt(SECURE_RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (matchRepository.findByMatchCode(code).isPresent());
        return code;
    }

    @Transactional
    public LocalMatchResponseDTO createLocalMatch(CreateLocalMatchRequest request, String userEmail) {
        userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team1 = createOrGetTeam(request.getTeam1Name());
        Team team2 = createOrGetTeam(request.getTeam2Name());

        if (team1.getId().equals(team2.getId())) {
            throw new RuntimeException("Team 1 and Team 2 cannot be the same");
        }

        Team battingTeam = (request.getBattingTeamId() != null && request.getBattingTeamId() == 1L) ? team1 : team2;

        Match match = new Match();
        match.setTeam1(team1);
        match.setTeam2(team2);
        match.setTossWinner(battingTeam);
        match.setTossDecision("BAT");
        match.setMatchDate(parseMatchDate(request.getMatchDate()));
        match.setMatchType(request.getMatchFormat() != null ? request.getMatchFormat() : "T20");
        match.setVenue(request.getLocation() != null && !request.getLocation().isBlank()
                ? request.getLocation() : "Local Ground");
        match.setDescription(request.getDescription());
        match.setStatus("UPCOMING");
        match.setTeam1Score(0L);
        match.setTeam2Score(0L);
        match.setTeam1Wickets(0L);
        match.setTeam2Wickets(0L);
        match.setCurrentOver(0);
        match.setCurrentBall(0);
        match.setCurrentInnings(1);
        match.setTotalOvers(request.getNumberOfOvers());
        match.setOversPerBowler(request.getOversPerBowler());
        match.setBallType(request.getBallType() != null ? request.getBallType() : "Tennis");
        match.setMatchCode(generateUniqueMatchCode());
        match.setCreatedByEmail(userEmail);

        Match saved = matchRepository.save(match);
        log.info("Local match created: id={}, {} vs {}", saved.getId(), team1.getName(), team2.getName());
        return toDTO(saved);
    }

    @Transactional
    public LocalMatchResponseDTO startMatch(Long matchId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        verifyOwner(match, userEmail);
        if (!"UPCOMING".equals(match.getStatus())) {
            throw new RuntimeException("Only UPCOMING matches can be started");
        }
        match.setStatus("LIVE");
        return toDTO(matchRepository.save(match));
    }

    @Transactional
    public LocalMatchResponseDTO updateScore(Long matchId, UpdateScoreRequest request, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        verifyOwner(match, userEmail);
        if (!"LIVE".equals(match.getStatus())) {
            throw new RuntimeException("Score can only be updated for LIVE matches");
        }
        if (request.getTeam1Score() != null) match.setTeam1Score(request.getTeam1Score());
        if (request.getTeam2Score() != null) match.setTeam2Score(request.getTeam2Score());
        if (request.getTeam1Wickets() != null) match.setTeam1Wickets(request.getTeam1Wickets());
        if (request.getTeam2Wickets() != null) match.setTeam2Wickets(request.getTeam2Wickets());
        if (request.getCurrentOver() != null) match.setCurrentOver(request.getCurrentOver());
        if (request.getCurrentBall() != null) match.setCurrentBall(request.getCurrentBall());
        if (request.getStriker() != null) match.setStriker(request.getStriker());
        if (request.getNonStriker() != null) match.setNonStriker(request.getNonStriker());
        if (request.getCurrentBowler() != null) match.setCurrentBowler(request.getCurrentBowler());
        return toDTO(matchRepository.save(match));
    }

    @Transactional
    public LocalMatchResponseDTO switchInnings(Long matchId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        verifyOwner(match, userEmail);
        if (!"LIVE".equals(match.getStatus())) {
            throw new RuntimeException("Only LIVE matches can switch innings");
        }
        if (match.getCurrentInnings() != null && match.getCurrentInnings() >= 2) {
            throw new RuntimeException("2nd innings has already started");
        }

        // Swap batting team: tossWinner switches to the other team
        Team currentBatting = match.getTossWinner();
        Team newBatting = (currentBatting != null && currentBatting.getId().equals(match.getTeam1().getId()))
                ? match.getTeam2()
                : match.getTeam1();

        match.setTossWinner(newBatting);
        match.setCurrentOver(0);
        match.setCurrentBall(0);
        match.setCurrentInnings(2);
        // Clear player names for 2nd innings — will be re-set by frontend
        match.setStriker(null);
        match.setNonStriker(null);
        match.setCurrentBowler(null);

        Match saved = matchRepository.save(match);
        log.info("Innings switched for match {}: now {} is batting", matchId, newBatting.getName());
        return toDTO(saved);
    }

    @Transactional
    public LocalMatchResponseDTO endMatch(Long matchId, Long winnerTeamId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        verifyOwner(match, userEmail);
        if (!"LIVE".equals(match.getStatus())) {
            throw new RuntimeException("Only LIVE matches can be ended");
        }
        match.setStatus("COMPLETED");
        if (winnerTeamId == null) {
            // No winner team supplied → the match was a TIE
            match.setWinner(null);
            log.info("Match {} ended in a TIE", matchId);
        } else {
            Team winner = teamRepository.findById(winnerTeamId)
                    .orElseThrow(() -> new RuntimeException("Winner team not found with id: " + winnerTeamId));
            match.setWinner(winner);
        }
        return toDTO(matchRepository.save(match));
    }

    /**
     * Ensures the acting user owns this match. Matches created before ownership
     * tracking existed (null createdByEmail) remain editable by any authenticated
     * user so legacy data is never locked out.
     */
    private void verifyOwner(Match match, String userEmail) {
        verifyOwner(match, userEmail, "score");
    }

    /** As {@link #verifyOwner(Match, String)}, with the attempted action named in the error. */
    private void verifyOwner(Match match, String userEmail, String action) {
        String owner = match.getCreatedByEmail();
        if (owner != null && !owner.equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Only the match creator can " + action + " this match");
        }
    }

    public LocalMatchResponseDTO getLocalMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        return toDTO(match);
    }

    /**
     * Fetch by id, but only for the owner. Ids are sequential and guessable, so
     * spectators must go through {@link #getLocalMatchByCode} instead.
     */
    public LocalMatchResponseDTO getOwnedLocalMatch(Long matchId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        verifyOwner(match, userEmail, "view");
        return toDTO(match);
    }

    public LocalMatchResponseDTO getLocalMatchByCode(String matchCode) {
        Match match = matchRepository.findByMatchCode(matchCode.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Match not found with code: " + matchCode));
        return toDTO(match);
    }

    /**
     * The match list is private to its creator: it doubles as the user's own
     * history, and listing every match would hand out other people's match codes.
     * Spectators reach another user's match only via {@link #getLocalMatchByCode}.
     */
    public List<LocalMatchResponseDTO> getMyLocalMatches(String userEmail) {
        return matchRepository.findByCreatedByEmailIgnoreCaseOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public void deleteMatch(Long matchId, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        verifyOwner(match, userEmail, "delete");
        if ("LIVE".equals(match.getStatus())) {
            throw new RuntimeException("Cannot delete a LIVE match. End the match first.");
        }
        matchRepository.delete(match);
        log.info("Match {} deleted by {}", matchId, userEmail);
    }

    /**
     * Stores the scorer's scorecard snapshot so spectators holding the match code
     * can see batter/bowler figures and ball-by-ball detail. Owner-only: this is
     * the authoritative scorecard for the match.
     *
     * Kept separate from {@link #updateScore} on purpose — the snapshot is a
     * convenience for viewers, and a failure here must never disrupt scoring.
     */
    @Transactional
    public void saveScoreState(Long matchId, String state, String userEmail) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));
        verifyOwner(match, userEmail);
        match.setScoreState(state);
        matchRepository.save(match);
    }

    /** Status filter over the caller's own matches only. */
    public List<LocalMatchResponseDTO> getMyLocalMatchesByStatus(String status, String userEmail) {
        return matchRepository.findByCreatedByEmailIgnoreCaseOrderByCreatedAtDesc(userEmail)
                .stream()
                .filter(m -> status.equalsIgnoreCase(m.getStatus()))
                .map(this::toDTO)
                .toList();
    }

    private Team createOrGetTeam(String teamName) {
        return teamRepository.findAll().stream()
                .filter(t -> t.getName().equalsIgnoreCase(teamName))
                .findFirst()
                .orElseGet(() -> {
                    Team newTeam = new Team();
                    newTeam.setName(teamName.trim());
                    newTeam.setDescription("Local match team");
                    newTeam.setCreatedAt(LocalDateTime.now());
                    newTeam.setUpdatedAt(LocalDateTime.now());
                    return teamRepository.save(newTeam);
                });
    }

    private LocalDateTime parseMatchDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return LocalDateTime.now();
        try {
            return LocalDateTime.parse(dateStr);
        } catch (Exception e1) {
            try {
                return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
            } catch (Exception e2) {
                log.warn("Could not parse matchDate '{}', using current time", dateStr);
                return LocalDateTime.now();
            }
        }
    }

    private LocalMatchResponseDTO toDTO(Match match) {
        Team battingTeam = match.getTossWinner();
        Team bowlingTeam = null;
        if (battingTeam != null) {
            bowlingTeam = battingTeam.getId().equals(match.getTeam1().getId())
                    ? match.getTeam2()
                    : match.getTeam1();
        }

        return LocalMatchResponseDTO.builder()
                .id(match.getId())
                .matchCode(match.getMatchCode())
                .team1Id(match.getTeam1().getId())
                .team2Id(match.getTeam2().getId())
                .team1Name(match.getTeam1().getName())
                .team2Name(match.getTeam2().getName())
                .battingTeam(battingTeam != null ? battingTeam.getName() : match.getTeam1().getName())
                .bowlingTeam(bowlingTeam != null ? bowlingTeam.getName() : match.getTeam2().getName())
                .matchFormat(match.getMatchType() != null ? match.getMatchType() : "T20")
                .location(match.getVenue() != null ? match.getVenue() : "Local Ground")
                .description(match.getDescription())
                .status(match.getStatus())
                .team1Score(match.getTeam1Score() != null ? match.getTeam1Score() : 0L)
                .team2Score(match.getTeam2Score() != null ? match.getTeam2Score() : 0L)
                .team1Wickets(match.getTeam1Wickets() != null ? match.getTeam1Wickets() : 0L)
                .team2Wickets(match.getTeam2Wickets() != null ? match.getTeam2Wickets() : 0L)
                .currentOver(match.getCurrentOver() != null ? match.getCurrentOver() : 0)
                .currentBall(match.getCurrentBall() != null ? match.getCurrentBall() : 0)
                .currentInnings(match.getCurrentInnings() != null ? match.getCurrentInnings() : 1)
                .totalOvers(match.getTotalOvers())
                .oversPerBowler(match.getOversPerBowler())
                .ballType(match.getBallType())
                .striker(match.getStriker())
                .nonStriker(match.getNonStriker())
                .currentBowler(match.getCurrentBowler())
                .winnerName(match.getWinner() != null ? match.getWinner().getName() : null)
                .isTie("COMPLETED".equals(match.getStatus()) && match.getWinner() == null)
                .createdByEmail(match.getCreatedByEmail())
                .scoreState(match.getScoreState())
                .matchDate(match.getMatchDate())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .build();
    }
}
