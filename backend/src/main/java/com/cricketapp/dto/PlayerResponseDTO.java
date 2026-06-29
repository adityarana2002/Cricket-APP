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
public class PlayerResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;              // BATSMAN, BOWLER, ALL_ROUNDER, WICKET_KEEPER
    private String battingHand;       // RIGHT, LEFT
    private String bowlingType;       // RIGHT, LEFT
    private String speciality;        // FAST_BOWLING, SPIN_BOWLING, BATTING, etc.
    private Integer jerseyNumber;
    private String description;
    private Long teamId;
    private String teamName;
    private String status;            // ACTIVE, INJURED, INACTIVE
    private Integer matchesPlayed;
    private Integer runsScored;
    private Integer wicketsTaken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
