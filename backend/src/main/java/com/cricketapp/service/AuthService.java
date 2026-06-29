package com.cricketapp.service;

import com.cricketapp.dto.LoginRequest;
import com.cricketapp.dto.LoginResponse;
import com.cricketapp.dto.RegisterRequest;
import com.cricketapp.dto.UpdateProfileRequest;
import com.cricketapp.dto.UserDTO;
import com.cricketapp.entity.User;
import com.cricketapp.repository.UserRepository;
import com.cricketapp.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new LoginResponse(
                token,
                token, // In production, use separate refresh token
                convertToDTO(user),
                "Login successful"
        );
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCountry(request.getCountry());
        user.setRole("PLAYER");
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        String token = jwtTokenProvider.generateTokenFromEmail(savedUser.getEmail());

        return new LoginResponse(
                token,
                token,
                convertToDTO(savedUser),
                "Registration successful"
        );
    }

    public LoginResponse refreshToken(String bearerToken) {
        String token = bearerToken;
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        if (email == null) {
            throw new RuntimeException("Invalid token");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String newToken = jwtTokenProvider.generateTokenFromEmail(email);
        return new LoginResponse(newToken, newToken, convertToDTO(user), "Token refreshed successfully");
    }

    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::convertToDTO);
    }

    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        return convertToDTO(userRepository.save(user));
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setBio(user.getBio());
        dto.setCountry(user.getCountry());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        return dto;
    }
}
