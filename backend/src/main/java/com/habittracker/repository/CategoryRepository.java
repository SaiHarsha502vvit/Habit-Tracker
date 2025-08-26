package com.habittracker.repository;

import com.habittracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category entity operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find category by name.
     */
    Optional<Category> findByName(String name);

    /**
     * Find all default categories.
     */
    List<Category> findByIsDefaultTrue();

    /**
     * Check if category name exists.
     */
    boolean existsByName(String name);
}
