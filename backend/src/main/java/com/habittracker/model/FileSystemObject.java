package com.habittracker.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 🗄️ FILE SYSTEM OBJECT MODEL
 * 
 * Represents a generic file system object in the unified enterprise file
 * system.
 * Used for content-addressable storage with Git-like hashing and metadata.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileSystemObject {

    private String hash;
    private String type;
    private String content;
    private LocalDateTime created;
    private LocalDateTime accessed;
    private Map<String, Object> metadata;
    private long size;

    // Constructor for basic object creation
    public FileSystemObject(String hash, String type, String content) {
        this.hash = hash;
        this.type = type;
        this.content = content;
        this.created = LocalDateTime.now();
        this.accessed = LocalDateTime.now();
        this.size = content != null ? content.getBytes().length : 0;
    }

    // Constructor with metadata
    public FileSystemObject(String hash, String type, String content, Map<String, Object> metadata) {
        this(hash, type, content);
        this.metadata = metadata;
    }

    // Update access time
    public void updateAccessTime() {
        this.accessed = LocalDateTime.now();
    }

    // Get content size
    public long getContentSize() {
        return content != null ? content.getBytes().length : 0;
    }
}
