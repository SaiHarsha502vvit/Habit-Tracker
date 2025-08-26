package com.habittracker.dto;

import com.habittracker.model.HabitFolder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for HabitFolder entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitFolderDTO {

    private Long id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private Long parentId;
    private String parentName;
    private Integer sortOrder;
    private HabitFolder.FolderType folderType;
    private Boolean isSystemFolder;
    private String smartCriteria;
    private Boolean isAutoPopulated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields for the frontend
    private String fullPath;
    private Integer depth;
    private Integer habitCount;
    private List<HabitFolderDTO> children;
    private Boolean hasChildren;

    /**
     * Create DTO from entity
     */
    public static HabitFolderDTO fromEntity(HabitFolder entity) {
        if (entity == null) return null;

        return HabitFolderDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .icon(entity.getIcon())
                .color(entity.getColor())
                .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .parentName(entity.getParent() != null ? entity.getParent().getName() : null)
                .sortOrder(entity.getSortOrder())
                .folderType(entity.getFolderType())
                .isSystemFolder(entity.getIsSystemFolder())
                .smartCriteria(entity.getSmartCriteria())
                .isAutoPopulated(entity.getIsAutoPopulated())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .fullPath(entity.getFullPath())
                .depth(entity.getDepth())
                .hasChildren(!entity.getChildren().isEmpty())
                .build();
    }

    /**
     * Create DTO from entity with children (for tree structure)
     */
    public static HabitFolderDTO fromEntityWithChildren(HabitFolder entity) {
        HabitFolderDTO dto = fromEntity(entity);
        if (dto != null && entity.getChildren() != null && !entity.getChildren().isEmpty()) {
            dto.setChildren(entity.getChildren().stream()
                    .map(HabitFolderDTO::fromEntity)
                    .toList());
        }
        return dto;
    }
}