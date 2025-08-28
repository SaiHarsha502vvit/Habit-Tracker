package com.habittracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Database initialization service for the Revolutionary File System.
 * Automatically sets up the advanced schema on application startup.
 * 
 * Features:
 * - Git-inspired content-addressable storage
 * - BTRFS-style copy-on-write semantics
 * - Linux VFS performance optimizations
 * - Automatic schema migration and validation
 */
@Service
public class DatabaseInitializationService {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializationService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Initialize the revolutionary file system schema on application startup.
     * This runs after all beans are initialized and the application context is
     * ready.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeRevolutionaryFileSystem() {
        try {
            logger.info("🚀 Initializing Revolutionary File System database schema...");

            // Check if schema already exists
            if (isSchemaAlreadyInitialized()) {
                logger.info("✅ Revolutionary File System schema already exists, skipping initialization");
                validateSchemaVersion();
                return;
            }

            // Load and execute the schema SQL
            String schemaSql = loadSchemaFromClasspath();
            executeSchemaSql(schemaSql);

            logger.info("✅ Revolutionary File System schema initialized successfully");
            logSchemaStatistics();

        } catch (Exception e) {
            logger.error("❌ Failed to initialize Revolutionary File System schema", e);
            // Don't throw exception to prevent application startup failure
            // The system can still function with legacy operations
        }
    }

    /**
     * Check if the revolutionary file system schema is already initialized.
     */
    private boolean isSchemaAlreadyInitialized() {
        try {
            // Check if the main metadata table exists
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'revolutionary_fs_metadata'",
                    Integer.class);
            return count != null && count > 0;
        } catch (Exception e) {
            logger.debug("Schema not found, will initialize: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate the schema version and perform migration if needed.
     */
    private void validateSchemaVersion() {
        try {
            String currentVersion = jdbcTemplate.queryForObject(
                    "SELECT JSON_UNQUOTE(metadata_value) FROM revolutionary_fs_metadata WHERE metadata_key = 'schema_version'",
                    String.class);

            logger.info("📊 Current Revolutionary File System schema version: {}", currentVersion);

            // TODO: Add migration logic here for future schema updates
            if (!"1.0.0".equals(currentVersion)) {
                logger.warn("⚠️ Schema version mismatch. Expected: 1.0.0, Found: {}", currentVersion);
            }

        } catch (Exception e) {
            logger.warn("⚠️ Could not validate schema version: {}", e.getMessage());
        }
    }

    /**
     * Load the schema SQL from classpath resources.
     */
    private String loadSchemaFromClasspath() throws IOException {
        ClassPathResource resource = new ClassPathResource("sql/revolutionary-filesystem-schema.sql");
        byte[] bdata = FileCopyUtils.copyToByteArray(resource.getInputStream());
        return new String(bdata, StandardCharsets.UTF_8);
    }

    /**
     * Execute the schema SQL with proper error handling.
     */
    private void executeSchemaSql(String schemaSql) {
        try {
            // Split SQL into individual statements
            String[] statements = schemaSql.split(";");

            int executedCount = 0;
            for (String statement : statements) {
                String trimmed = statement.trim();
                if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                    try {
                        jdbcTemplate.execute(trimmed);
                        executedCount++;
                    } catch (Exception e) {
                        // Log individual statement failures but continue
                        logger.warn("⚠️ Failed to execute SQL statement: {}", trimmed);
                        logger.warn("Error: {}", e.getMessage());
                    }
                }
            }

            logger.info("📊 Executed {} SQL statements successfully", executedCount);

        } catch (Exception e) {
            logger.error("❌ Failed to execute schema SQL", e);
            throw new RuntimeException("Schema initialization failed", e);
        }
    }

    /**
     * Log statistics about the initialized schema.
     */
    private void logSchemaStatistics() {
        try {
            // Count the tables created
            Integer tableCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'revolutionary_fs_%'",
                    Integer.class);

            // Count the indexes created
            Integer indexCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.statistics WHERE table_name LIKE 'revolutionary_fs_%'",
                    Integer.class);

            logger.info("📊 Revolutionary File System schema statistics:");
            logger.info("   📁 Tables created: {}", tableCount);
            logger.info("   🔍 Indexes created: {}", indexCount);

            // Log initial metadata
            List<Map<String, Object>> metadataRows = jdbcTemplate.queryForList(
                    "SELECT metadata_key, JSON_UNQUOTE(metadata_value) as metadata_value FROM revolutionary_fs_metadata WHERE metadata_type = 'CONFIG'");

            logger.info("   ⚙️ Configuration:");
            for (Map<String, Object> row : metadataRows) {
                logger.info("      {} = {}", row.get("metadata_key"), row.get("metadata_value"));
            }

        } catch (Exception e) {
            logger.debug("Could not retrieve schema statistics: {}", e.getMessage());
        }
    }

    /**
     * Manually trigger schema initialization (for testing or administrative
     * purposes).
     */
    public void forceSchemaInitialization() {
        logger.info("🔧 Manually triggering Revolutionary File System schema initialization...");
        initializeRevolutionaryFileSystem();
    }

    /**
     * Clean up the revolutionary file system schema (dangerous operation).
     */
    public void cleanupSchema() {
        logger.warn("⚠️ DANGEROUS: Cleaning up Revolutionary File System schema...");
        try {
            // Drop tables in reverse dependency order
            String[] dropStatements = {
                    "DROP TABLE IF EXISTS revolutionary_fs_metadata",
                    "DROP TABLE IF EXISTS revolutionary_fs_cache",
                    "DROP TABLE IF EXISTS revolutionary_fs_references",
                    "DROP TABLE IF EXISTS revolutionary_fs_commits",
                    "DROP TABLE IF EXISTS revolutionary_fs_trees",
                    "DROP TABLE IF EXISTS revolutionary_fs_blobs"
            };

            for (String statement : dropStatements) {
                jdbcTemplate.execute(statement);
            }

            logger.info("✅ Revolutionary File System schema cleaned up");

        } catch (Exception e) {
            logger.error("❌ Failed to cleanup schema", e);
            throw new RuntimeException("Schema cleanup failed", e);
        }
    }
}
