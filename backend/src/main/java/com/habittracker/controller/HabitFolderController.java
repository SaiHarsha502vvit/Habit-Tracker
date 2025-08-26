package com.habittracker.controller;

import com.habittracker.dto.HabitFolderDTO;
import com.habittracker.service.HabitFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST controller for managing habit folders and hierarchical organization
 */
@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Habit Folders", description = "Manage hierarchical organization of habits")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://habit-tracker-ui.vercel.app"})
public class HabitFolderController {

    private final HabitFolderService folderService;

    /**
     * Create a new folder
     */
    @Operation(summary = "Create a new folder", 
               description = "Create a new folder for organizing habits hierarchically")
    @PostMapping
    public ResponseEntity<HabitFolderDTO> createFolder(
            @Valid @RequestBody HabitFolderDTO folderDTO) {
        
        log.info("Creating folder: {}", folderDTO.getName());
        
        try {
            HabitFolderDTO created = folderService.createFolder(folderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid folder data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error creating folder: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get folder tree structure
     */
    @Operation(summary = "Get folder tree", 
               description = "Retrieve all folders organized in a hierarchical tree structure")
    @GetMapping("/tree")
    public ResponseEntity<List<HabitFolderDTO>> getFolderTree() {
        log.debug("Getting folder tree");
        
        try {
            List<HabitFolderDTO> folderTree = folderService.getFolderTree();
            return ResponseEntity.ok(folderTree);
        } catch (Exception e) {
            log.error("Error getting folder tree: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all folders (flat list)
     */
    @Operation(summary = "Get all folders", 
               description = "Retrieve all folders as a flat list")
    @GetMapping
    public ResponseEntity<List<HabitFolderDTO>> getAllFolders() {
        log.debug("Getting all folders");
        
        try {
            List<HabitFolderDTO> folders = folderService.getAllFolders();
            return ResponseEntity.ok(folders);
        } catch (Exception e) {
            log.error("Error getting folders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get folder by ID
     */
    @Operation(summary = "Get folder by ID", 
               description = "Retrieve a specific folder by its ID")
    @GetMapping("/{folderId}")
    public ResponseEntity<HabitFolderDTO> getFolderById(
            @Parameter(description = "Folder ID") @PathVariable Long folderId) {
        
        log.debug("Getting folder: {}", folderId);
        
        try {
            HabitFolderDTO folder = folderService.getFolderById(folderId);
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            log.error("Error getting folder {}: {}", folderId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update folder
     */
    @Operation(summary = "Update folder", 
               description = "Update an existing folder's properties")
    @PutMapping("/{folderId}")
    public ResponseEntity<HabitFolderDTO> updateFolder(
            @Parameter(description = "Folder ID") @PathVariable Long folderId,
            @Valid @RequestBody HabitFolderDTO updates) {
        
        log.info("Updating folder: {}", folderId);
        
        try {
            HabitFolderDTO updated = folderService.updateFolder(folderId, updates);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid update data for folder {}: {}", folderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error updating folder {}: {}", folderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete folder
     */
    @Operation(summary = "Delete folder", 
               description = "Delete a folder and move its contents to the parent or root")
    @DeleteMapping("/{folderId}")
    public ResponseEntity<Void> deleteFolder(
            @Parameter(description = "Folder ID") @PathVariable Long folderId) {
        
        log.info("Deleting folder: {}", folderId);
        
        try {
            folderService.deleteFolder(folderId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Cannot delete folder {}: {}", folderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error deleting folder {}: {}", folderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search folders
     */
    @Operation(summary = "Search folders", 
               description = "Search folders by name")
    @GetMapping("/search")
    public ResponseEntity<List<HabitFolderDTO>> searchFolders(
            @Parameter(description = "Search term") @RequestParam String q) {
        
        log.debug("Searching folders with term: {}", q);
        
        try {
            List<HabitFolderDTO> folders = folderService.searchFolders(q);
            return ResponseEntity.ok(folders);
        } catch (Exception e) {
            log.error("Error searching folders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}