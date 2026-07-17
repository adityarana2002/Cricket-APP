package com.cricketapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocalMatchResponseDTO {
    private Long id;
    private String matchCode;
    private Long team1Id;
    private Long team2Id;
    private String team1Name;
    private String team2Name;
    private String battingTeam;
    private String bowlingTeam;
    private String matchFormat;
    private String location;
    private String description;
    private String status;
    private Long team1Score;
    private Long team2Score;
    private Long team1Wickets;
    private Long team2Wickets;
    private Integer currentOver;
    private Integer currentBall;
    private Integer currentInnings;
    private Integer totalOvers;
    private Integer oversPerBowler;
    private String ballType;
    private String striker;
    private String nonStriker;
    private String currentBowler;
    private String winnerName;
    private Boolean isTie;
    private String createdByEmail;

    /** Scorecard snapshot JSON (batters/bowlers/ball events) — see Match.scoreState. */
    private String scoreState;
    private LocalDateTime matchDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
