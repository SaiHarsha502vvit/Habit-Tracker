package com.habittracker.service;

import com.habittracker.dto.AuthResponseDto;
import com.habittracker.dto.UserLoginDto;
import com.habittracker.dto.UserRegistrationDto;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.model.User;
import com.habittracker.repository.UserRepository;
import com.habittracker.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for user authentication and management.
 * Implements UserDetailsService for Spring Security integration.
 */
@Service
@Slf4j
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return user;
    }

    /**
     * Register a new user.
     */
    @Transactional
    public AuthResponseDto registerUser(UserRegistrationDto registrationDto) {
        log.info("Registering new user: {}", registrationDto.getUsername());

        // Check if username exists
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        // Check if email exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Create new user
        User user = User.builder()
                .username(registrationDto.getUsername())
                .email(registrationDto.getEmail())
                .password(passwordEncoder.encode(registrationDto.getPassword()))
                .firstName(registrationDto.getFirstName())
                .lastName(registrationDto.getLastName())
                .build();

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String jwt = jwtTokenProvider.generateTokenFromUsername(savedUser.getUsername());

        return new AuthResponseDto(jwt, savedUser.getUsername(), savedUser.getEmail(),
                savedUser.getFirstName(), savedUser.getLastName());
    }

    /**
     * Authenticate user and return JWT token.
     */
    public AuthResponseDto authenticateUser(UserLoginDto loginDto) {
        log.info("Authenticating user: {}", loginDto.getUsernameOrEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsernameOrEmail(),
                        loginDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        User user = (User) authentication.getPrincipal();

        return new AuthResponseDto(jwt, user.getUsername(), user.getEmail(),
                user.getFirstName(), user.getLastName());
    }

    /**
     * Get current authenticated user.
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            return null; // Return null for unauthenticated users (backward compatibility)
        }

        return (User) authentication.getPrincipal();
    }

    /**
     * Get user by ID.
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    /**
     * Check if current user exists (for backward compatibility).
     */
    public boolean isUserAuthenticated() {
        return getCurrentUser() != null;
    }
}
