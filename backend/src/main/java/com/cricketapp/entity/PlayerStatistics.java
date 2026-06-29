package com.cricketapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "player_statistics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    private Integer matchesPlayed = 0;

    private Integer runsScored = 0;

    private Integer highestScore = 0;

    private Double averageScore = 0.0;

    private Double strikeRate = 0.0;

    private Integer wicketsTaken = 0;

    private Integer ballsBowled = 0;

    private Integer runsConceded = 0;

    private Double economyRate = 0.0;

    private Integer catches = 0;

    private Integer stumpings = 0;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public void incrementMatches() {
        this.matchesPlayed++;
    }

    public void addRuns(Integer runs) {
        this.runsScored += runs;
        updateAverageScore();
    }

    public void updateAverageScore() {
        if (matchesPlayed > 0) {
            this.averageScore = (double) runsScored / matchesPlayed;
        }
    }
}
