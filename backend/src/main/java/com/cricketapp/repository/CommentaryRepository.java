package com.cricketapp.repository;

import com.cricketapp.entity.Commentary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaryRepository extends JpaRepository<Commentary, Long> {
    List<Commentary> findByMatchId(Long matchId);
    List<Commentary> findByInningsId(Long inningsId);
}
