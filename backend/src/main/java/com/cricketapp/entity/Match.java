package com.cricketapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "team1_id", nullable = false)
    private Team team1;

    @ManyToOne
    @JoinColumn(name = "team2_id", nullable = false)
    private Team team2;

    @Column(nullable = false)
    private LocalDateTime matchDate;

    private String venue;

    private String matchType; // T20, ODI, Test

    private String status = "UPCOMING"; // UPCOMING, ONGOING, COMPLETED

    @ManyToOne
    @JoinColumn(name = "toss_winner_id")
    private Team tossWinner;

    private String tossDecision; // BAT, BOWL

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private Team winner;

    @ManyToOne
    @JoinColumn(name = "man_of_match_id")
    private Player manOfMatch;

    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long team1Score = 0L;

    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long team2Score = 0L;

    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long team1Wickets = 0L;

    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long team2Wickets = 0L;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer currentOver = 0;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer currentBall = 0;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer currentInnings = 1;

    private Integer totalOvers;       // Custom overs per innings (null = unlimited)
    private Integer oversPerBowler;   // Bowling restriction
    private String ballType;          // Tennis, Leather, Other

    private String striker;           // Name of current batsman on strike
    private String nonStriker;        // Name of current batsman off strike
    private String currentBowler;     // Name of current bowler

    @Column(unique = true, length = 10)
    private String matchCode;

    // Email of the user who created this match — only this user (the scorer/owner)
    // may edit the score. Null for legacy matches created before ownership existed.
    private String createdByEmail;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = LAZY)
    private List<Innings> innings;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = LAZY)
    private List<Commentary> commentaries;
}
