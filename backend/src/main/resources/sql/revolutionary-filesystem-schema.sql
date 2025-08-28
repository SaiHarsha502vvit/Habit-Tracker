-- Revolutionary File System Schema
-- Based on Git + BTRFS + Linux VFS design patterns
-- Content-addressable storage with copy-on-write semantics

-- Drop existing tables (in correct dependency order)
DROP TABLE IF EXISTS revolutionary_fs_metadata;

DROP TABLE IF EXISTS revolutionary_fs_cache;

DROP TABLE IF EXISTS revolutionary_fs_references;

DROP TABLE IF EXISTS revolutionary_fs_commits;

DROP TABLE IF EXISTS revolutionary_fs_trees;

DROP TABLE IF EXISTS revolutionary_fs_blobs;

-- 1. Content-addressable blob storage (Git-inspired)
CREATE TABLE revolutionary_fs_blobs (
    content_hash VARCHAR(64) PRIMARY KEY COMMENT 'SHA-256 hash of content',
    content_data LONGTEXT NOT NULL COMMENT 'JSON content data',
    blob_size BIGINT NOT NULL COMMENT 'Size in bytes for quick access',
    blob_type VARCHAR(50) NOT NULL COMMENT 'Type: habit, folder_metadata, etc',
    compression_algorithm VARCHAR(20) DEFAULT 'NONE' COMMENT 'Compression used',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_count BIGINT DEFAULT 1 COMMENT 'For LRU cache management',
    INDEX idx_blob_type (blob_type),
    INDEX idx_blob_size (blob_size),
    INDEX idx_created_at (created_at),
    INDEX idx_last_accessed (last_accessed)
) ENGINE = InnoDB COMMENT = 'Content-addressable blob storage';

-- 2. Tree objects representing directory structure (Git-inspired)
CREATE TABLE revolutionary_fs_trees (
    tree_hash VARCHAR(64) PRIMARY KEY COMMENT 'SHA-256 hash of tree structure',
    parent_tree_hash VARCHAR(64) COMMENT 'Parent tree for efficient traversal',
    tree_data JSON NOT NULL COMMENT 'Tree structure as JSON',
    entry_count INT NOT NULL COMMENT 'Number of entries for quick checks',
    depth_level INT NOT NULL DEFAULT 0 COMMENT 'Tree depth for optimization',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_tree_hash) REFERENCES revolutionary_fs_trees (tree_hash) ON DELETE SET NULL,
    INDEX idx_parent_tree (parent_tree_hash),
    INDEX idx_depth_level (depth_level),
    INDEX idx_entry_count (entry_count),
    INDEX idx_last_modified (last_modified)
) ENGINE = InnoDB COMMENT = 'Tree objects for directory structure';

-- 3. Commit objects for version control (Git-inspired)
CREATE TABLE revolutionary_fs_commits (
    commit_hash VARCHAR(64) PRIMARY KEY COMMENT 'SHA-256 hash of commit',
    root_tree_hash VARCHAR(64) NOT NULL COMMENT 'Root tree of this commit',
    parent_commit_hash VARCHAR(64) COMMENT 'Previous commit for history',
    operation_type VARCHAR(50) NOT NULL COMMENT 'COPY, MOVE, DELETE, CREATE, etc',
    operation_metadata JSON COMMENT 'Operation-specific metadata',
    user_id BIGINT COMMENT 'User who performed the operation',
    commit_message VARCHAR(500) COMMENT 'Human-readable description',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (root_tree_hash) REFERENCES revolutionary_fs_trees (tree_hash),
    FOREIGN KEY (parent_commit_hash) REFERENCES revolutionary_fs_commits (commit_hash),
    INDEX idx_root_tree (root_tree_hash),
    INDEX idx_parent_commit (parent_commit_hash),
    INDEX idx_operation_type (operation_type),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB COMMENT = 'Commit objects for version control';

-- 4. Reference counting for efficient COW (BTRFS-inspired)
CREATE TABLE revolutionary_fs_references (
    object_hash VARCHAR(64) NOT NULL COMMENT 'Hash of referenced object',
    object_type ENUM('blob', 'tree', 'commit') NOT NULL,
    reference_count BIGINT NOT NULL DEFAULT 1 COMMENT 'Number of references',
    first_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_referenced TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (object_hash, object_type),
    INDEX idx_reference_count (reference_count),
    INDEX idx_last_referenced (last_referenced)
) ENGINE = InnoDB COMMENT = 'Reference counting for garbage collection';

-- 5. Performance cache for path resolution (Linux VFS-inspired)
CREATE TABLE revolutionary_fs_cache (
    cache_key VARCHAR(255) PRIMARY KEY COMMENT 'Path or query key',
    cache_type VARCHAR(50) NOT NULL COMMENT 'PATH, SEARCH, TREE, etc',
    cached_data JSON NOT NULL COMMENT 'Cached result',
    expiry_time TIMESTAMP NOT NULL COMMENT 'When cache expires',
    hit_count BIGINT DEFAULT 0 COMMENT 'Cache hit statistics',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_hit TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cache_type (cache_type),
    INDEX idx_expiry_time (expiry_time),
    INDEX idx_hit_count (hit_count),
    INDEX idx_last_hit (last_hit)
) ENGINE = InnoDB COMMENT = 'Performance cache for path resolution';

-- 6. System metadata and configuration
CREATE TABLE revolutionary_fs_metadata (
    metadata_key VARCHAR(100) PRIMARY KEY,
    metadata_value JSON NOT NULL,
    metadata_type VARCHAR(50) NOT NULL COMMENT 'CONFIG, STATS, VERSION, etc',
    is_system BOOLEAN DEFAULT TRUE COMMENT 'System vs user metadata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_metadata_type (metadata_type),
    INDEX idx_is_system (is_system),
    INDEX idx_updated_at (updated_at)
) ENGINE = InnoDB COMMENT = 'System metadata and configuration';

-- Initialize system metadata
INSERT INTO
    revolutionary_fs_metadata (
        metadata_key,
        metadata_value,
        metadata_type
    )
VALUES (
        'schema_version',
        '"1.0.0"',
        'VERSION'
    ),
    (
        'gc_last_run',
        'null',
        'STATS'
    ),
    ('total_objects', '0', 'STATS'),
    (
        'cache_hit_ratio',
        '0.0',
        'STATS'
    ),
    (
        'compression_enabled',
        'false',
        'CONFIG'
    ),
    (
        'max_cache_size',
        '10000',
        'CONFIG'
    ),
    (
        'gc_threshold',
        '1000',
        'CONFIG'
    );

-- Create advanced indexes for performance
CREATE INDEX idx_blobs_composite ON revolutionary_fs_blobs (
    blob_type,
    blob_size,
    created_at
);

CREATE INDEX idx_trees_composite ON revolutionary_fs_trees (
    parent_tree_hash,
    depth_level,
    entry_count
);

CREATE INDEX idx_commits_operation ON revolutionary_fs_commits (
    operation_type,
    user_id,
    created_at
);

CREATE INDEX idx_cache_composite ON revolutionary_fs_cache (
    cache_type,
    expiry_time,
    hit_count
);

-- Performance views for monitoring
CREATE VIEW revolutionary_fs_stats AS
SELECT
    'blobs' as object_type,
    COUNT(*) as count,
    AVG(blob_size) as avg_size,
    SUM(blob_size) as total_size
FROM revolutionary_fs_blobs
UNION ALL
SELECT
    'trees' as object_type,
    COUNT(*) as count,
    AVG(entry_count) as avg_size,
    SUM(entry_count) as total_size
FROM revolutionary_fs_trees
UNION ALL
SELECT
    'commits' as object_type,
    COUNT(*) as count,
    NULL as avg_size,
    NULL as total_size
FROM revolutionary_fs_commits;

CREATE VIEW revolutionary_fs_cache_stats AS
SELECT
    cache_type,
    COUNT(*) as total_entries,
    SUM(hit_count) as total_hits,
    AVG(hit_count) as avg_hits_per_entry,
    COUNT(
        CASE
            WHEN expiry_time > NOW() THEN 1
        END
    ) as valid_entries
FROM revolutionary_fs_cache
GROUP BY
    cache_type;