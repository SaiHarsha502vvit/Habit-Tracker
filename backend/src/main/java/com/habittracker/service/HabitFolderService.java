package com.habittracker.service;

import com.habittracker.dto.HabitFolderDTO;
import com.habittracker.model.HabitFolder;
import com.habittracker.model.User;
import com.habittracker.repository.HabitFolderRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing habit folders and hierarchical organization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HabitFolderService {

    private final HabitFolderRepository folderRepository;
    private final HabitRepository habitRepository;
    private final UserService userService;

    /**
     * Create a new folder
     */
    @Transactional
    public HabitFolderDTO createFolder(HabitFolderDTO folderDTO) {
        log.info("Creating new folder: {}", folderDTO.getName());

        User currentUser = userService.getCurrentUser();
        
        // Check for duplicate folder names in the same parent
        Optional<HabitFolder> existing = folderRepository.findByUserAndNameAndParent(
            currentUser.getId(), folderDTO.getName(), folderDTO.getParentId());
        
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Folder with this name already exists in the same location");
        }

        HabitFolder.HabitFolderBuilder builder = HabitFolder.builder()
                .name(folderDTO.getName())
                .description(folderDTO.getDescription())
                .icon(folderDTO.getIcon() != null ? folderDTO.getIcon() : "📁")
                .color(folderDTO.getColor() != null ? folderDTO.getColor() : "#6B7280")
                .sortOrder(folderDTO.getSortOrder() != null ? folderDTO.getSortOrder() : 0)
                .folderType(folderDTO.getFolderType() != null ? folderDTO.getFolderType() : HabitFolder.FolderType.CUSTOM)
                .isSystemFolder(false)
                .user(currentUser);

        // Set parent if provided
        if (folderDTO.getParentId() != null) {
            HabitFolder parent = folderRepository.findById(folderDTO.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found: " + folderDTO.getParentId()));
            
            // Verify parent belongs to the same user
            if (!parent.getUser().getId().equals(currentUser.getId())) {
                throw new IllegalArgumentException("Cannot create folder under another user's folder");
            }
            
            builder.parent(parent);
        }

        HabitFolder folder = folderRepository.save(builder.build());
        log.info("Created folder: {}", folder.getId());

        return HabitFolderDTO.fromEntity(folder);
    }

    /**
     * Get all folders for current user as a tree structure
     */
    public List<HabitFolderDTO> getFolderTree() {
        User currentUser = userService.getCurrentUser();
        log.debug("Getting folder tree for user: {}", currentUser.getId());

        List<HabitFolder> rootFolders = folderRepository.findRootFoldersByUser(currentUser.getId());
        return rootFolders.stream()
                .map(this::buildFolderTreeDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all folders for current user (flat list)
     */
    public List<HabitFolderDTO> getAllFolders() {
        User currentUser = userService.getCurrentUser();
        log.debug("Getting all folders for user: {}", currentUser.getId());

        List<HabitFolder> folders = folderRepository.findAllByUser(currentUser.getId());
        return folders.stream()
                .map(this::buildFolderDTOWithCounts)
                .collect(Collectors.toList());
    }

    /**
     * Get folder by ID
     */
    public HabitFolderDTO getFolderById(Long folderId) {
        log.debug("Getting folder: {}", folderId);

        HabitFolder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found: " + folderId));

        // Verify access
        User currentUser = userService.getCurrentUser();
        if (!folder.getUser().getId().equals(currentUser.getId()) && !folder.getIsSystemFolder()) {
            throw new IllegalArgumentException("Access denied to folder: " + folderId);
        }

        return buildFolderDTOWithCounts(folder);
    }

    /**
     * Update folder
     */
    @Transactional
    public HabitFolderDTO updateFolder(Long folderId, HabitFolderDTO updates) {
        log.info("Updating folder: {}", folderId);

        HabitFolder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found: " + folderId));

        User currentUser = userService.getCurrentUser();
        if (!folder.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Cannot update another user's folder");
        }

        if (folder.getIsSystemFolder()) {
            throw new IllegalArgumentException("Cannot update system folder");
        }

        // Update fields
        if (updates.getName() != null && !updates.getName().equals(folder.getName())) {
            // Check for duplicates
            Optional<HabitFolder> existing = folderRepository.findByUserAndNameAndParent(
                currentUser.getId(), updates.getName(), 
                folder.getParent() != null ? folder.getParent().getId() : null);
            
            if (existing.isPresent() && !existing.get().getId().equals(folderId)) {
                throw new IllegalArgumentException("Folder with this name already exists in the same location");
            }
            folder.setName(updates.getName());
        }

        if (updates.getDescription() != null) {
            folder.setDescription(updates.getDescription());
        }
        if (updates.getIcon() != null) {
            folder.setIcon(updates.getIcon());
        }
        if (updates.getColor() != null) {
            folder.setColor(updates.getColor());
        }
        if (updates.getSortOrder() != null) {
            folder.setSortOrder(updates.getSortOrder());
        }

        HabitFolder saved = folderRepository.save(folder);
        return HabitFolderDTO.fromEntity(saved);
    }

    /**
     * Delete folder (and move its contents to parent or root)
     */
    @Transactional
    public void deleteFolder(Long folderId) {
        log.info("Deleting folder: {}", folderId);

        HabitFolder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found: " + folderId));

        User currentUser = userService.getCurrentUser();
        if (!folder.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Cannot delete another user's folder");
        }

        if (folder.getIsSystemFolder()) {
            throw new IllegalArgumentException("Cannot delete system folder");
        }

        // Move child folders to parent or root
        List<HabitFolder> childFolders = folderRepository.findByParentId(folderId);
        for (HabitFolder child : childFolders) {
            child.setParent(folder.getParent());
            folderRepository.save(child);
        }

        // Move habits to parent folder or root
        // This would be handled by the habit service when needed

        folderRepository.delete(folder);
        log.info("Deleted folder: {}", folderId);
    }

    /**
     * Search folders by name
     */
    public List<HabitFolderDTO> searchFolders(String searchTerm) {
        User currentUser = userService.getCurrentUser();
        log.debug("Searching folders with term: {} for user: {}", searchTerm, currentUser.getId());

        List<HabitFolder> folders = folderRepository.searchFoldersByName(currentUser.getId(), searchTerm);
        return folders.stream()
                .map(this::buildFolderDTOWithCounts)
                .collect(Collectors.toList());
    }

    /**
     * Initialize default system folders for a user
     */
    @Transactional
    public void initializeSystemFolders(User user) {
        log.info("Initializing system folders for user: {}", user.getId());

        // Check if system folders already exist
        List<HabitFolder> existingSystemFolders = folderRepository.findByUserAndFolderType(
            user.getId(), HabitFolder.FolderType.SMART);
        
        if (!existingSystemFolders.isEmpty()) {
            log.debug("System folders already exist for user: {}", user.getId());
            return;
        }

        // Create default smart folders
        createSystemFolder(user, "📅 Today's Focus", "Habits due today", 
                          HabitFolder.FolderType.COMPLETION, "{\"type\":\"today\"}", 1);
        
        createSystemFolder(user, "🔥 High Priority", "High priority habits", 
                          HabitFolder.FolderType.PRIORITY, "{\"priority\":\"HIGH\"}", 2);
        
        createSystemFolder(user, "📚 Learning & Development", "Educational habits", 
                          HabitFolder.FolderType.CATEGORY, "{\"categoryName\":\"Learning\"}", 3);
        
        createSystemFolder(user, "💪 Health & Fitness", "Health and fitness habits", 
                          HabitFolder.FolderType.CATEGORY, "{\"categoryName\":\"Health\"}", 4);
        
        createSystemFolder(user, "📁 Uncategorized", "Habits without folders", 
                          HabitFolder.FolderType.CUSTOM, "{\"type\":\"uncategorized\"}", 5);

        log.info("Created system folders for user: {}", user.getId());
    }

    /**
     * Helper method to create system folders
     */
    private void createSystemFolder(User user, String name, String description, 
                                  HabitFolder.FolderType type, String criteria, int sortOrder) {
        HabitFolder folder = HabitFolder.builder()
                .name(name)
                .description(description)
                .icon("📁")
                .color("#6B7280")
                .folderType(type)
                .isSystemFolder(true)
                .isAutoPopulated(true)
                .smartCriteria(criteria)
                .sortOrder(sortOrder)
                .user(user)
                .build();

        folderRepository.save(folder);
    }

    /**
     * Build folder DTO with child folders
     */
    private HabitFolderDTO buildFolderTreeDTO(HabitFolder folder) {
        HabitFolderDTO dto = buildFolderDTOWithCounts(folder);
        
        if (!folder.getChildren().isEmpty()) {
            List<HabitFolderDTO> children = folder.getChildren().stream()
                    .map(this::buildFolderTreeDTO)
                    .collect(Collectors.toList());
            dto.setChildren(children);
        }
        
        return dto;
    }

    /**
     * Build folder DTO with habit counts
     */
    private HabitFolderDTO buildFolderDTOWithCounts(HabitFolder folder) {
        HabitFolderDTO dto = HabitFolderDTO.fromEntity(folder);
        
        // Add habit count
        long habitCount = folderRepository.countHabitsInFolder(folder.getId());
        dto.setHabitCount((int) habitCount);
        
        return dto;
    }
}