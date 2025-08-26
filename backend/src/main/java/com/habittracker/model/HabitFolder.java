package com.habittracker.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a folder for hierarchical organization of habits.
 * Supports nested folder structures and smart folder functionality.
 */
@Entity
@Table(name = "habit_folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String icon; // Emoji or icon name

    @Column(length = 7)
    @Builder.Default
    private String color = "#6B7280"; // Default gray color

    // Hierarchical structure support
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private HabitFolder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<HabitFolder> children = new ArrayList<>();

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    // User association
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Smart folder functionality
    @Enumerated(EnumType.STRING)
    @Column(name = "folder_type")
    @Builder.Default
    private FolderType folderType = FolderType.CUSTOM;

    @Column(name = "is_system_folder")
    @Builder.Default
    private Boolean isSystemFolder = false;

    // Smart folder rules (stored as JSON or simple criteria)
    @Column(name = "smart_criteria", columnDefinition = "TEXT")
    private String smartCriteria; // JSON string defining automatic inclusion rules

    @Column(name = "is_auto_populated")
    @Builder.Default
    private Boolean isAutoPopulated = false;

    // Timestamps
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Enum defining different types of folders
     */
    public enum FolderType {
        CUSTOM,         // User-created folder
        SMART,          // Auto-populated based on criteria
        CATEGORY,       // Based on habit categories
        PRIORITY,       // Based on priority levels
        COMPLETION,     // Based on completion status
        DATE            // Based on date ranges
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Helper method to get the full path of this folder
     */
    public String getFullPath() {
        if (parent == null) {
            return name;
        }
        return parent.getFullPath() + " / " + name;
    }

    /**
     * Helper method to check if this folder is a root folder
     */
    public boolean isRoot() {
        return parent == null;
    }

    /**
     * Helper method to get the depth level of this folder
     */
    public int getDepth() {
        if (parent == null) {
            return 0;
        }
        return parent.getDepth() + 1;
    }

    /**
     * Helper method to check if this folder contains another folder
     */
    public boolean contains(HabitFolder folder) {
        if (folder == null) return false;
        
        HabitFolder current = folder.getParent();
        while (current != null) {
            if (current.getId().equals(this.id)) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }
}