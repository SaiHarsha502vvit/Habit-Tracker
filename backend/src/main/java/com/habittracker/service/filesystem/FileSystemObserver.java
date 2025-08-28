package com.habittracker.service.filesystem;

/**
 * 🎯 Unified File System Observer Interface
 * 
 * Part of the Observer Pattern implementation for real-time
 * file system change notifications across devices and sessions.
 */
public interface FileSystemObserver {
    
    /**
     * Called when a file system object is created
     */
    void onObjectCreated(String objectHash, String objectType, String path);
    
    /**
     * Called when a file system object is updated
     */
    void onObjectUpdated(String objectHash, String objectType, String path);
    
    /**
     * Called when a file system object is deleted
     */
    void onObjectDeleted(String objectHash, String objectType, String path);
    
    /**
     * Called when cache invalidation occurs
     */
    void onCacheInvalidated(String path, String reason);
    
    /**
     * Called when a batch operation completes
     */
    void onBatchOperationCompleted(String operationType, int objectCount, long executionTimeMs);
}
