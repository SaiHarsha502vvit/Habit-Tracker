-- Unified Enterprise File System Schema Fix
-- This script adds missing tables and columns for the ultimate file manager

-- Fix fs_objects table structure
DROP TABLE IF EXISTS fs_objects;

CREATE TABLE fs_objects (
    object_id VARCHAR(64) PRIMARY KEY,
    content LONGBLOB,
    object_type VARCHAR(50),
    size_bytes BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_count BIGINT DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    compression_type VARCHAR(20) DEFAULT 'none',
    INDEX idx_object_type (object_type),
    INDEX idx_created_at (created_at),
    INDEX idx_access_count (access_count)
);

-- Fix fs_refs table
DROP TABLE IF EXISTS fs_refs;

CREATE TABLE fs_refs (
    ref_name VARCHAR(255) PRIMARY KEY,
    object_id VARCHAR(64),
    ref_type VARCHAR(50),
    user_id BIGINT,
    folder_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 1,
    INDEX idx_user_folder (user_id, folder_id),
    INDEX idx_object_id (object_id),
    INDEX idx_ref_type (ref_type),
    FOREIGN KEY (object_id) REFERENCES fs_objects (object_id) ON DELETE CASCADE
);

-- Fix fs_index table
DROP TABLE IF EXISTS fs_index;

CREATE TABLE fs_index (
    path_hash VARCHAR(64) PRIMARY KEY,
    full_path VARCHAR(1000),
    object_id VARCHAR(64),
    user_id BIGINT,
    folder_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_frequency BIGINT DEFAULT 0,
    INDEX idx_full_path (full_path),
    INDEX idx_user_folder (user_id, folder_id),
    INDEX idx_access_frequency (access_frequency)
);

-- Fix fs_cache table
DROP TABLE IF EXISTS fs_cache;

CREATE TABLE fs_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_value TEXT,
    cache_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    hit_count BIGINT DEFAULT 0,
    INDEX idx_cache_type (cache_type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_hit_count (hit_count)
);

-- Fix fs_sync_log table
DROP TABLE IF EXISTS fs_sync_log;

CREATE TABLE fs_sync_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operation_id VARCHAR(64),
    operation_type VARCHAR(50),
    entity_ids TEXT,
    user_id BIGINT,
    device_id VARCHAR(100),
    sync_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    INDEX idx_operation_id (operation_id),
    INDEX idx_user_device (user_id, device_id),
    INDEX idx_sync_status (sync_status),
    INDEX idx_created_at (created_at)
);

-- Add missing category_id column to habits if it doesn't exist
ALTER TABLE habits ADD COLUMN IF NOT EXISTS category_id BIGINT;

-- Add foreign key for category if it doesn't exist
ALTER TABLE habits
ADD CONSTRAINT IF NOT EXISTS fk_habits_category_id FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL;

-- Add is_deleted column to habits if it doesn't exist
ALTER TABLE habits
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_habits_category_id ON habits (category_id);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits (user_id);

CREATE INDEX IF NOT EXISTS idx_habits_folder_id ON habits (folder_id);

CREATE INDEX IF NOT EXISTS idx_habits_is_deleted ON habits (is_deleted);

-- Ensure categories table exists
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_categories_name_user (name, user_id),
    INDEX idx_categories_user_id (user_id)
);

-- Ensure habit_folders table exists with proper structure
CREATE TABLE IF NOT EXISTS habit_folders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_folder_id BIGINT,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    INDEX idx_habit_folders_parent (parent_folder_id),
    INDEX idx_habit_folders_user (user_id),
    INDEX idx_habit_folders_archived (is_archived),
    FOREIGN KEY (parent_folder_id) REFERENCES habit_folders (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);