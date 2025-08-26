package com.habittracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for Category entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDto {

    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Size(min = 7, max = 7, message = "Color must be a valid hex code")
    @Builder.Default
    private String color = "#6B7280";

    @Size(max = 50, message = "Icon must not exceed 50 characters")
    @Builder.Default
    private String icon = "📋";

    private String createdAt;
    private String updatedAt;

    @Builder.Default
    private boolean isDefault = false;
}
