package com.cricketapp.service;

import com.cricketapp.dto.CreatePlayerRequest;
import com.cricketapp.dto.PlayerResponseDTO;
import com.cricketapp.entity.Player;
import com.cricketapp.entity.Team;
import com.cricketapp.entity.User;
import com.cricketapp.repository.PlayerRepository;
import com.cricketapp.repository.TeamRepository;
import com.cricketapp.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    public PlayerResponseDTO createPlayer(CreatePlayerRequest request, String userEmail) {
        try {
            log.info("Creating player for user: {}", userEmail);

            // Get current user
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create a new user for the player if email is provided
            User playerUser = userRepository.findByEmail(request.getEmail())
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(request.getEmail());
                        newUser.setFirstName(request.getFirstName());
                        newUser.setLastName(request.getLastName());
                        newUser.setPhone(request.getPhoneNumber());
                        newUser.setRole("PLAYER");
                        newUser.setIsActive(true);
                        newUser.setCreatedAt(LocalDateTime.now());
                        newUser.setUpdatedAt(LocalDateTime.now());
                        newUser.setPassword("default_password");  // Default password, should be changed
                        return userRepository.save(newUser);
                    });

            // Create player
            Player player = new Player();
            player.setUser(playerUser);
            player.setJerseyNumber(request.getJerseyNumber());
            player.setBattingStyle(request.getBattingHand());
            player.setBowlingStyle(request.getBowlingType());
            player.setPlayingRole(request.getRole());
            player.setIsActive(true);
            player.setCreatedAt(LocalDateTime.now());
            player.setUpdatedAt(LocalDateTime.now());

            // Assign to team if provided
            if (request.getTeamId() != null) {
                Team team = teamRepository.findById(request.getTeamId())
                        .orElseThrow(() -> new RuntimeException("Team not found"));
                player.setTeam(team);
            }

            Player savedPlayer = playerRepository.save(player);

            log.info("Player created successfully with ID: {}", savedPlayer.getId());

            return convertToDTO(savedPlayer);

        } catch (Exception e) {
            log.error("Error creating player: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create player: " + e.getMessage());
        }
    }

    public PlayerResponseDTO getPlayer(Long playerId) {
        try {
            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));
            return convertToDTO(player);

        } catch (Exception e) {
            log.error("Error fetching player: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch player: " + e.getMessage());
        }
    }

    public List<PlayerResponseDTO> getAllPlayers() {
        try {
            List<Player> players = playerRepository.findAll();
            return players.stream()
                    .map(this::convertToDTO)
                    .toList();

        } catch (Exception e) {
            log.error("Error fetching all players: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch players: " + e.getMessage());
        }
    }

    public List<PlayerResponseDTO> getPlayersByTeam(Long teamId) {
        try {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found"));

            List<Player> players = playerRepository.findByTeamId(teamId);
            return players.stream()
                    .map(this::convertToDTO)
                    .toList();

        } catch (Exception e) {
            log.error("Error fetching players by team: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch players: " + e.getMessage());
        }
    }

    public List<PlayerResponseDTO> getPlayersByRole(String role) {
        try {
            List<Player> players = playerRepository.findByPlayingRole(role);
            return players.stream()
                    .map(this::convertToDTO)
                    .toList();

        } catch (Exception e) {
            log.error("Error fetching players by role: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch players: " + e.getMessage());
        }
    }

    public PlayerResponseDTO updatePlayer(Long playerId, CreatePlayerRequest request) {
        try {
            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));

            // Update user details
            User playerUser = player.getUser();
            playerUser.setFirstName(request.getFirstName());
            playerUser.setLastName(request.getLastName());
            playerUser.setPhone(request.getPhoneNumber());
            userRepository.save(playerUser);

            // Update player details
            player.setJerseyNumber(request.getJerseyNumber());
            player.setBattingStyle(request.getBattingHand());
            player.setBowlingStyle(request.getBowlingType());
            player.setPlayingRole(request.getRole());
            player.setUpdatedAt(LocalDateTime.now());

            // Update team if provided
            if (request.getTeamId() != null) {
                Team team = teamRepository.findById(request.getTeamId())
                        .orElseThrow(() -> new RuntimeException("Team not found"));
                player.setTeam(team);
            }

            Player updatedPlayer = playerRepository.save(player);

            log.info("Player {} updated successfully", playerId);
            return convertToDTO(updatedPlayer);

        } catch (Exception e) {
            log.error("Error updating player: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update player: " + e.getMessage());
        }
    }

    public void deletePlayer(Long playerId) {
        try {
            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));

            playerRepository.delete(player);

            log.info("Player {} deleted successfully", playerId);

        } catch (Exception e) {
            log.error("Error deleting player: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete player: " + e.getMessage());
        }
    }

    public PlayerResponseDTO activatePlayer(Long playerId) {
        try {
            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));

            player.setIsActive(true);
            player.setUpdatedAt(LocalDateTime.now());
            Player updatedPlayer = playerRepository.save(player);

            log.info("Player {} activated", playerId);
            return convertToDTO(updatedPlayer);

        } catch (Exception e) {
            log.error("Error activating player: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to activate player: " + e.getMessage());
        }
    }

    public PlayerResponseDTO deactivatePlayer(Long playerId) {
        try {
            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));

            player.setIsActive(false);
            player.setUpdatedAt(LocalDateTime.now());
            Player updatedPlayer = playerRepository.save(player);

            log.info("Player {} deactivated", playerId);
            return convertToDTO(updatedPlayer);

        } catch (Exception e) {
            log.error("Error deactivating player: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to deactivate player: " + e.getMessage());
        }
    }

    private PlayerResponseDTO convertToDTO(Player player) {
        return PlayerResponseDTO.builder()
                .id(player.getId())
                .firstName(player.getUser().getFirstName())
                .lastName(player.getUser().getLastName())
                .fullName(player.getUser().getFirstName() + " " + player.getUser().getLastName())
                .email(player.getUser().getEmail())
                .phoneNumber(player.getUser().getPhone())
                .role(player.getPlayingRole())
                .battingHand(player.getBattingStyle())
                .bowlingType(player.getBowlingStyle())
                .jerseyNumber(player.getJerseyNumber())
                .teamId(player.getTeam() != null ? player.getTeam().getId() : null)
                .teamName(player.getTeam() != null ? player.getTeam().getName() : "No Team")
                .status(player.getIsActive() ? "ACTIVE" : "INACTIVE")
                .createdAt(player.getCreatedAt())
                .updatedAt(player.getUpdatedAt())
                .build();
    }
}
