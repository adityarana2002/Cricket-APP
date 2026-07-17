package com.cricketapp.repository;

import com.cricketapp.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByStatus(String status);
    List<Match> findByTournamentId(Long tournamentId);
    List<Match> findByTeam1IdOrTeam2Id(Long team1Id, Long team2Id);
    List<Match> findByMatchDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    Optional<Match> findByMatchCode(String matchCode);

    /**
     * Matches owned by one user, newest first. Backs the match list, which is
     * private per creator — spectators reach other people's matches only by
     * supplying the match code.
     */
    List<Match> findByCreatedByEmailIgnoreCaseOrderByCreatedAtDesc(String createdByEmail);
}
