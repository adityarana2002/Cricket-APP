package com.cricketapp.repository;

import com.cricketapp.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByUserId(Long userId);
    List<Player> findByTeamId(Long teamId);
    List<Player> findByPlayingRole(String playingRole);
    List<Player> findByIsActiveTrue();
}
