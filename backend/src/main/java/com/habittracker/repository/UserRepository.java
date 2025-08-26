package com.habittracker.repository;

import com.habittracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by username for authentication.
     */
    Optional<User> findByUsername(String username);

    /**
     * Find user by email for authentication and password reset.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if username exists for validation.
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists for validation.
     */
    boolean existsByEmail(String email);
}
