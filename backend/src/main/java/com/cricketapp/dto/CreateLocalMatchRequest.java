package com.cricketapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateLocalMatchRequest {
    private String team1Name;
    private String team2Name;
    private Long battingTeamId;  // 1 = team1 bats first, 2 = team2 bats first
    private String matchFormat;  // T20, ODI, Test, Friendly
    private String location;
    private String description;
    private String matchDate;        // Optional ISO datetime string (e.g. "2024-06-20T14:30")
    private Integer numberOfOvers;   // Custom overs per innings (overrides format default)
    private Integer oversPerBowler;  // Bowling restriction per bowler
    private String ballType;         // Tennis, Leather, Other
}
