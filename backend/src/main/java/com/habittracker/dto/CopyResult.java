package com.habittracker.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Result of copy/paste operations in the Unified Enterprise File System
 */
public class CopyResult {
    private boolean success;
    private String message;
    private String operationId;
    private int copiedCount;
    private List<String> newEntityIds;
    private long duration;
    private String errorCode;
    private List<String> successfulCopies;
    private Map<String, String> failedCopies;
    private Map<String, Object> performanceMetrics;

    // Constructor
    public CopyResult() {
        this.successfulCopies = new ArrayList<>();
        this.failedCopies = new HashMap<>();
        this.performanceMetrics = new HashMap<>();
    }

    // Private constructor for builder pattern
    private CopyResult(boolean success, String message, String operationId,
            int copiedCount, List<String> newEntityIds, long duration, String errorCode) {
        this();
        this.success = success;
        this.message = message;
        this.operationId = operationId;
        this.copiedCount = copiedCount;
        this.newEntityIds = newEntityIds;
        this.duration = duration;
        this.errorCode = errorCode;
    }

    // Factory methods
    public static CopyResult success(int copiedCount, List<String> newEntityIds, String operationId, long duration) {
        return new CopyResult(true, "Copy operation completed successfully", operationId,
                copiedCount, newEntityIds, duration, null);
    }

    public static CopyResult failure(String message, String operationId) {
        return new CopyResult(false, message, operationId, 0, null, 0, "COPY_FAILED");
    }

    public static CopyResult failure(String message, String operationId, String errorCode) {
        return new CopyResult(false, message, operationId, 0, null, 0, errorCode);
    }

    // Getters
    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getOperationId() {
        return operationId;
    }

    public int getCopiedCount() {
        return copiedCount;
    }

    public List<String> getNewEntityIds() {
        return newEntityIds;
    }

    public long getDuration() {
        return duration;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public List<String> getSuccessfulCopies() {
        return successfulCopies;
    }

    public Map<String, String> getFailedCopies() {
        return failedCopies;
    }

    public Map<String, Object> getPerformanceMetrics() {
        return performanceMetrics;
    }

    // Setter methods for building the result
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setCopiedCount(int copiedCount) {
        this.copiedCount = copiedCount;
    }

    public void addSuccessfulCopy(String entityId, int count) {
        if (this.successfulCopies == null) {
            this.successfulCopies = new ArrayList<>();
        }
        this.successfulCopies.add(entityId);
        this.copiedCount += count;
    }

    public void addFailedCopy(String entityId, String reason) {
        if (this.failedCopies == null) {
            this.failedCopies = new HashMap<>();
        }
        this.failedCopies.put(entityId, reason);
    }

    public void addPerformanceMetric(String key, Object value) {
        if (this.performanceMetrics == null) {
            this.performanceMetrics = new HashMap<>();
        }
        this.performanceMetrics.put(key, value);
    }

    // Methods needed for RevolutionaryFileSystemService compatibility
    public void addSuccess(Long objectId, String path) {
        if (this.successfulCopies == null) {
            this.successfulCopies = new ArrayList<>();
        }
        this.successfulCopies.add(path != null ? path : String.valueOf(objectId));
        this.copiedCount++;
    }

    public void addFailure(Long objectId, String reason) {
        if (this.failedCopies == null) {
            this.failedCopies = new HashMap<>();
        }
        this.failedCopies.put(String.valueOf(objectId), reason);
    }

    public boolean hasSuccesses() {
        return successfulCopies != null && !successfulCopies.isEmpty();
    }

    public List<String> getSuccessfulObjects() {
        return successfulCopies != null ? successfulCopies : new ArrayList<>();
    }

    public void setOverallError(String error) {
        this.success = false;
        this.message = error;
        this.errorCode = "OVERALL_ERROR";
    }

    // Methods needed for RevolutionaryFileSystemController compatibility
    public int getTotalObjects() {
        return copiedCount + (failedCopies != null ? failedCopies.size() : 0);
    }

    public int getFailedObjects() {
        return failedCopies != null ? failedCopies.size() : 0;
    }

    public String getNewCommitHash() {
        // Return the operationId as commit hash for compatibility
        return operationId;
    }

    @Override
    public String toString() {
        return String.format("CopyResult{success=%s, copiedCount=%d, operationId='%s', duration=%dms, message='%s'}",
                success, copiedCount, operationId, duration, message);
    }
}
