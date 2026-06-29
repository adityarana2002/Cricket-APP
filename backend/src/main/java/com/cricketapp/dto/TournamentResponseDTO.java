package com.cricketapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentResponseDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String format;
    private String location;
    private String status;
    private Long createdById;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
