package com.cricketapp.service;

import com.cricketapp.dto.CreateTournamentRequest;
import com.cricketapp.dto.TournamentResponseDTO;
import com.cricketapp.entity.Tournament;
import com.cricketapp.entity.User;
import com.cricketapp.repository.TournamentRepository;
import com.cricketapp.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;

    public TournamentResponseDTO createTournament(CreateTournamentRequest request, String email) {
        log.info("Creating tournament: {}", request.getName());
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setDescription(request.getDescription());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setFormat(request.getFormat());
        tournament.setLocation(request.getLocation());
        tournament.setStatus(request.getStatus() != null ? request.getStatus() : "UPCOMING");
        tournament.setCreatedBy(user);

        Tournament saved = tournamentRepository.save(tournament);
        log.info("Tournament created with ID: {}", saved.getId());
        
        return convertToDTO(saved);
    }

    public TournamentResponseDTO getTournament(Long id) {
        log.info("Fetching tournament with ID: {}", id);
        
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        return convertToDTO(tournament);
    }

    public List<TournamentResponseDTO> getAllTournaments() {
        log.info("Fetching all tournaments");
        
        return tournamentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TournamentResponseDTO> getTournamentsByStatus(String status) {
        log.info("Fetching tournaments by status: {}", status);
        
        return tournamentRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TournamentResponseDTO updateTournament(Long id, CreateTournamentRequest request) {
        log.info("Updating tournament with ID: {}", id);
        
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (request.getName() != null) {
            tournament.setName(request.getName());
        }
        if (request.getDescription() != null) {
            tournament.setDescription(request.getDescription());
        }
        if (request.getStartDate() != null) {
            tournament.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            tournament.setEndDate(request.getEndDate());
        }
        if (request.getFormat() != null) {
            tournament.setFormat(request.getFormat());
        }
        if (request.getLocation() != null) {
            tournament.setLocation(request.getLocation());
        }
        if (request.getStatus() != null) {
            tournament.setStatus(request.getStatus());
        }

        Tournament updated = tournamentRepository.save(tournament);
        log.info("Tournament updated: {}", updated.getId());
        
        return convertToDTO(updated);
    }

    public void deleteTournament(Long id) {
        log.info("Deleting tournament with ID: {}", id);
        
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        tournamentRepository.delete(tournament);
        log.info("Tournament deleted: {}", id);
    }

    private TournamentResponseDTO convertToDTO(Tournament tournament) {
        return new TournamentResponseDTO(
                tournament.getId(),
                tournament.getName(),
                tournament.getDescription(),
                tournament.getStartDate(),
                tournament.getEndDate(),
                tournament.getFormat(),
                tournament.getLocation(),
                tournament.getStatus(),
                tournament.getCreatedBy() != null ? tournament.getCreatedBy().getId() : null,
                tournament.getCreatedBy() != null ? tournament.getCreatedBy().getEmail() : null,
                tournament.getCreatedAt(),
                tournament.getUpdatedAt()
        );
    }
}
