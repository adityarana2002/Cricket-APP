package com.cricketapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreatePlayerRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String role;           // BATSMAN, BOWLER, ALL_ROUNDER, WICKET_KEEPER
    private String battingHand;    // RIGHT, LEFT
    private String bowlingType;    // RIGHT, LEFT
    private String speciality;     // FAST_BOWLING, SPIN_BOWLING, BATTING, etc.
    private Integer jerseyNumber;
    private String description;
    private Long teamId;           // Optional: assign to team
}
