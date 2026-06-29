package com.cricketapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "innings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Innings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne
    @JoinColumn(name = "batting_team_id", nullable = false)
    private Team battingTeam;

    @ManyToOne
    @JoinColumn(name = "bowling_team_id", nullable = false)
    private Team bowlingTeam;

    private Integer inningsNumber;

    private Integer runs = 0;

    private Integer wickets = 0;

    private Double overs = 0.0;

    private Integer extras = 0;

    private Boolean isCompleted = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
