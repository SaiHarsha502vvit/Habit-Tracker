package com.habittracker.repository;

import com.habittracker.model.HabitFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for HabitFolder entity operations.
 */
@Repository
public interface HabitFolderRepository extends JpaRepository<HabitFolder, Long> {

    /**
     * Find root folders (folders with no parent) for a user
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.user.id = :userId AND f.parent IS NULL ORDER BY f.sortOrder ASC, f.name ASC")
    List<HabitFolder> findRootFoldersByUser(@Param("userId") Long userId);

    /**
     * Find all folders for a user
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.user.id = :userId ORDER BY f.parent.id ASC, f.sortOrder ASC, f.name ASC")
    List<HabitFolder> findAllByUser(@Param("userId") Long userId);

    /**
     * Find children folders of a parent folder
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.parent.id = :parentId ORDER BY f.sortOrder ASC, f.name ASC")
    List<HabitFolder> findByParentId(@Param("parentId") Long parentId);

    /**
     * Find folders by type for a user
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.user.id = :userId AND f.folderType = :folderType ORDER BY f.sortOrder ASC, f.name ASC")
    List<HabitFolder> findByUserAndFolderType(@Param("userId") Long userId, @Param("folderType") HabitFolder.FolderType folderType);

    /**
     * Find system folders
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.isSystemFolder = true ORDER BY f.sortOrder ASC")
    List<HabitFolder> findSystemFolders();

    /**
     * Find folder by name and parent for a user (for uniqueness check)
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.user.id = :userId AND f.name = :name AND " +
           "(:parentId IS NULL AND f.parent IS NULL OR f.parent.id = :parentId)")
    Optional<HabitFolder> findByUserAndNameAndParent(@Param("userId") Long userId, 
                                                    @Param("name") String name, 
                                                    @Param("parentId") Long parentId);

    /**
     * Find smart folders (auto-populated) for a user
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.user.id = :userId AND f.isAutoPopulated = true ORDER BY f.sortOrder ASC")
    List<HabitFolder> findSmartFoldersByUser(@Param("userId") Long userId);

    /**
     * Count habits in a folder (including subfolders)
     */
    @Query("SELECT COUNT(h) FROM Habit h WHERE h.folder.id = :folderId")
    long countHabitsInFolder(@Param("folderId") Long folderId);

    /**
     * Search folders by name for a user
     */
    @Query("SELECT f FROM HabitFolder f WHERE f.user.id = :userId AND " +
           "LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY f.name ASC")
    List<HabitFolder> searchFoldersByName(@Param("userId") Long userId, @Param("searchTerm") String searchTerm);
}