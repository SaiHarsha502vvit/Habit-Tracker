package com.habittracker.controller;

import com.habittracker.service.DataExportImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * REST Controller for data export and import operations
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DataExportImportController {

    private final DataExportImportService dataExportImportService;

    /**
     * Export all user data as JSON
     */
    @GetMapping("/export/data")
    public ResponseEntity<String> exportData() {
        try {
            // For now, export all data (no user-specific filtering)
            String jsonData = dataExportImportService.exportUserData(null);
            
            String filename = "habit-tracker-export-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss")) + 
                ".json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                .headers(headers)
                .body(jsonData);
        } catch (Exception e) {
            log.error("Export failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Export failed: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Import user data from JSON file
     */
    @PostMapping("/import/data")
    public ResponseEntity<?> importData(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("{\"error\": \"No file provided\"}");
            }

            if (!file.getOriginalFilename().endsWith(".json")) {
                return ResponseEntity.badRequest()
                    .body("{\"error\": \"Only JSON files are supported\"}");
            }

            // For now, import without user-specific filtering
            DataExportImportService.ImportResult result = 
                dataExportImportService.importUserData(file, null);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Import failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Import failed: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Export data in CSV format (simplified)
     */
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportCsv() {
        try {
            // This is a simplified CSV export - could be enhanced
            String csvData = "Feature,Description\n" +
                "CSV Export,\"This is a placeholder for CSV export functionality\"\n" +
                "JSON Export,\"Use /api/export/data for full JSON export\"";

            String filename = "habit-tracker-export-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + 
                ".csv";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
        } catch (Exception e) {
            log.error("CSV export failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("error,message\nfailed,\"" + e.getMessage() + "\"");
        }
    }
}