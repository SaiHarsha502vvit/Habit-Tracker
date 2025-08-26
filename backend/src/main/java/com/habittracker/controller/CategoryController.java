package com.habittracker.controller;

import com.habittracker.dto.CategoryDto;
import com.habittracker.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for category management.
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" }, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Category Controller", description = "APIs for managing habit categories")
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Get all categories.
     */
    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieves all available categories")
    @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        log.info("GET /api/categories - Fetching all categories");
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get default categories.
     */
    @GetMapping("/defaults")
    @Operation(summary = "Get default categories", description = "Retrieves all default system categories")
    @ApiResponse(responseCode = "200", description = "Default categories retrieved successfully")
    public ResponseEntity<List<CategoryDto>> getDefaultCategories() {
        log.info("GET /api/categories/defaults - Fetching default categories");
        List<CategoryDto> categories = categoryService.getDefaultCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get category by ID.
     */
    @GetMapping("/{categoryId}")
    @Operation(summary = "Get category by ID", description = "Retrieves a specific category by its ID")
    @ApiResponse(responseCode = "200", description = "Category retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long categoryId) {
        log.info("GET /api/categories/{} - Fetching category", categoryId);
        CategoryDto category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(category);
    }

    /**
     * Create a new category.
     */
    @PostMapping
    @Operation(summary = "Create a new category", description = "Creates a new habit category")
    @ApiResponse(responseCode = "201", description = "Category created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data or category name already exists")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        log.info("POST /api/categories - Creating category: {}", categoryDto.getName());
        CategoryDto createdCategory = categoryService.createCategory(categoryDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    /**
     * Update category.
     */
    @PutMapping("/{categoryId}")
    @Operation(summary = "Update category", description = "Updates an existing category")
    @ApiResponse(responseCode = "200", description = "Category updated successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long categoryId,
            @Valid @RequestBody CategoryDto categoryDto) {
        log.info("PUT /api/categories/{} - Updating category", categoryId);
        CategoryDto updatedCategory = categoryService.updateCategory(categoryId, categoryDto);
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * Delete category.
     */
    @DeleteMapping("/{categoryId}")
    @Operation(summary = "Delete category", description = "Deletes a category (except default categories)")
    @ApiResponse(responseCode = "204", description = "Category deleted successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    @ApiResponse(responseCode = "400", description = "Cannot delete default category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        log.info("DELETE /api/categories/{} - Deleting category", categoryId);
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}
