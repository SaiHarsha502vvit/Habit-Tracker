package com.habittracker.service;

import com.habittracker.dto.CategoryDto;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.model.Category;
import com.habittracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for category management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Create a new category.
     */
    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        log.info("Creating new category: {}", categoryDto.getName());

        // Check if category name already exists
        if (categoryRepository.existsByName(categoryDto.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + categoryDto.getName());
        }

        Category category = Category.builder()
                .name(categoryDto.getName())
                .description(categoryDto.getDescription())
                .color(categoryDto.getColor())
                .icon(categoryDto.getIcon())
                .isDefault(false) // User-created categories are not default
                .build();

        Category savedCategory = categoryRepository.save(category);
        return mapToDto(savedCategory);
    }

    /**
     * Get all categories.
     */
    public List<CategoryDto> getAllCategories() {
        log.info("Fetching all categories");
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get category by ID.
     */
    public CategoryDto getCategoryById(Long categoryId) {
        log.info("Fetching category with ID: {}", categoryId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));
        return mapToDto(category);
    }

    /**
     * Update category.
     */
    @Transactional
    public CategoryDto updateCategory(Long categoryId, CategoryDto categoryDto) {
        log.info("Updating category with ID: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        // Check if new name conflicts with existing categories
        if (!category.getName().equals(categoryDto.getName()) &&
                categoryRepository.existsByName(categoryDto.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + categoryDto.getName());
        }

        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        category.setColor(categoryDto.getColor());
        category.setIcon(categoryDto.getIcon());
        category.setUpdatedAt(LocalDateTime.now());

        Category updatedCategory = categoryRepository.save(category);
        return mapToDto(updatedCategory);
    }

    /**
     * Delete category.
     */
    @Transactional
    public void deleteCategory(Long categoryId) {
        log.info("Deleting category with ID: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        // Prevent deletion of default categories
        if (category.isDefault()) {
            throw new IllegalArgumentException("Cannot delete default category");
        }

        categoryRepository.deleteById(categoryId);
    }

    /**
     * Get default categories.
     */
    public List<CategoryDto> getDefaultCategories() {
        log.info("Fetching default categories");
        return categoryRepository.findByIsDefaultTrue()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Initialize default categories if they don't exist.
     */
    @Transactional
    public void initializeDefaultCategories() {
        if (categoryRepository.findByIsDefaultTrue().isEmpty()) {
            log.info("Initializing default categories");

            List<Category> defaultCategories = List.of(
                    Category.builder().name("Health & Fitness").description("Physical health and exercise habits")
                            .color("#10B981").icon("💪").isDefault(true).build(),
                    Category.builder().name("Learning").description("Educational and skill development")
                            .color("#3B82F6").icon("📚").isDefault(true).build(),
                    Category.builder().name("Productivity").description("Work and productivity habits")
                            .color("#8B5CF6").icon("⚡").isDefault(true).build(),
                    Category.builder().name("Mindfulness").description("Mental health and meditation")
                            .color("#06B6D4").icon("🧘").isDefault(true).build(),
                    Category.builder().name("Social").description("Relationships and social activities")
                            .color("#F59E0B").icon("👥").isDefault(true).build(),
                    Category.builder().name("Creative").description("Creative and artistic pursuits")
                            .color("#EF4444").icon("🎨").isDefault(true).build());

            categoryRepository.saveAll(defaultCategories);
        }
    }

    /**
     * Map Category entity to DTO.
     */
    private CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .icon(category.getIcon())
                .createdAt(category.getCreatedAt().toString())
                .updatedAt(category.getUpdatedAt() != null ? category.getUpdatedAt().toString() : null)
                .isDefault(category.isDefault())
                .build();
    }
}
