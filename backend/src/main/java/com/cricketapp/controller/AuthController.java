package com.cricketapp.controller;

import com.cricketapp.dto.LoginRequest;
import com.cricketapp.dto.LoginResponse;
import com.cricketapp.dto.RegisterRequest;
import com.cricketapp.dto.UpdateProfileRequest;
import com.cricketapp.dto.UserDTO;
import com.cricketapp.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@AllArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponse> refreshToken(@RequestHeader("Authorization") String token) {
        LoginResponse response = authService.refreshToken(token);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        return authService.getUserByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        if (authentication == null) return ResponseEntity.status(401).build();
        UserDTO updated = authService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(updated);
    }
}
