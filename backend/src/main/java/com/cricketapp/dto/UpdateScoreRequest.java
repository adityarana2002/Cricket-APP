package com.cricketapp.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateScoreRequest {
    private Long team1Score;
    private Long team2Score;
    private Long team1Wickets;
    private Long team2Wickets;
    private Integer currentOver;
    private Integer currentBall;
    private String striker;
    private String nonStriker;
    private String currentBowler;
}
