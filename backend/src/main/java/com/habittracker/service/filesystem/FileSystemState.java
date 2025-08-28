package com.habittracker.service.filesystem;

import java.time.LocalDateTime;

/**
 * 🔄 File System State Management
 * 
 * Represents the current state of file system objects
 * with optimistic locking and conflict resolution.
 */
public class FileSystemState {
    
    private String objectHash;
    private String objectType;
    private String path;
    private long version;
    private LocalDateTime lastModified;
    private String lastModifiedBy;
    private boolean isLocked;
    private String lockOwner;
    private LocalDateTime lockExpiry;
    
    public FileSystemState() {}
    
    public FileSystemState(String objectHash, String objectType, String path) {
        this.objectHash = objectHash;
        this.objectType = objectType;
        this.path = path;
        this.version = 1;
        this.lastModified = LocalDateTime.now();
        this.isLocked = false;
    }
    
    // Getters and Setters
    public String getObjectHash() { return objectHash; }
    public void setObjectHash(String objectHash) { this.objectHash = objectHash; }
    
    public String getObjectType() { return objectType; }
    public void setObjectType(String objectType) { this.objectType = objectType; }
    
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    
    public long getVersion() { return version; }
    public void setVersion(long version) { this.version = version; }
    
    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }
    
    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
    
    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }
    
    public String getLockOwner() { return lockOwner; }
    public void setLockOwner(String lockOwner) { this.lockOwner = lockOwner; }
    
    public LocalDateTime getLockExpiry() { return lockExpiry; }
    public void setLockExpiry(LocalDateTime lockExpiry) { this.lockExpiry = lockExpiry; }
    
    /**
     * 🔒 Optimistic locking support
     */
    public synchronized boolean tryLock(String owner, long durationMinutes) {
        if (isLocked && lockExpiry.isAfter(LocalDateTime.now())) {
            return false; // Already locked
        }
        
        this.isLocked = true;
        this.lockOwner = owner;
        this.lockExpiry = LocalDateTime.now().plusMinutes(durationMinutes);
        return true;
    }
    
    /**
     * 🔓 Release lock
     */
    public synchronized void unlock(String owner) {
        if (lockOwner != null && lockOwner.equals(owner)) {
            this.isLocked = false;
            this.lockOwner = null;
            this.lockExpiry = null;
        }
    }
    
    /**
     * ⚡ Version increment for optimistic concurrency
     */
    public synchronized void incrementVersion() {
        this.version++;
        this.lastModified = LocalDateTime.now();
    }
    
    /**
     * ✅ Check if lock is expired
     */
    public boolean isLockExpired() {
        return isLocked && lockExpiry != null && lockExpiry.isBefore(LocalDateTime.now());
    }
}
