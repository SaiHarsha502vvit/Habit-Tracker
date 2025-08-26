package com.habittracker.controller;

import com.habittracker.dto.AuthResponseDto;
import com.habittracker.dto.UserLoginDto;
import com.habittracker.dto.UserRegistrationDto;
import com.habittracker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" }, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication Controller", description = "APIs for user authentication and registration")
public class AuthController {

    private final UserService userService;

    /**
     * Register a new user.
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns JWT token")
    @ApiResponse(responseCode = "201", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data or user already exists")
    public ResponseEntity<AuthResponseDto> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        log.info("POST /api/auth/register - Registering user: {}", registrationDto.getUsername());

        try {
            AuthResponseDto authResponse = userService.registerUser(registrationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (IllegalArgumentException e) {
            log.warn("Registration failed: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Authenticate user login.
     */
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user credentials and returns JWT token")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public ResponseEntity<AuthResponseDto> loginUser(@Valid @RequestBody UserLoginDto loginDto) {
        log.info("POST /api/auth/login - Authenticating user: {}", loginDto.getUsernameOrEmail());

        AuthResponseDto authResponse = userService.authenticateUser(loginDto);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * Get current authenticated user information.
     */
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns current authenticated user information")
    @ApiResponse(responseCode = "200", description = "User information retrieved successfully")
    @ApiResponse(responseCode = "401", description = "User not authenticated")
    public ResponseEntity<AuthResponseDto> getCurrentUser() {
        log.info("GET /api/auth/me - Getting current user");

        com.habittracker.model.User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            log.warn("No authenticated user found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Return user info without generating a new token
        AuthResponseDto response = new AuthResponseDto(
                null, // No new token needed
                currentUser.getUsername(),
                currentUser.getEmail(),
                currentUser.getFirstName(),
                currentUser.getLastName());

        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint to verify authentication service is running.
     */
    @GetMapping("/health")
    @Operation(summary = "Authentication service health check", description = "Checks if authentication service is running")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<String> healthCheck() {
        log.info("GET /api/auth/health - Health check");
        return ResponseEntity.ok("Authentication service is running");
    }
}
