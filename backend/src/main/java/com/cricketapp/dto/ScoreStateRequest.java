package com.cricketapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Carries the scorer's scorecard snapshot. {@code state} is a JSON document
 * produced and consumed by the client; the server stores it verbatim.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoreStateRequest {
    private String state;
}
