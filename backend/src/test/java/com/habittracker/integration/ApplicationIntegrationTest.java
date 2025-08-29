package com.habittracker.integration;

import com.habittracker.dto.HabitDto;
import com.habittracker.dto.HabitFolderDTO;
import com.habittracker.service.HabitService;
import com.habittracker.service.HabitFolderService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test to validate that the main services compile and can be instantiated
 */
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.profiles.active=test"
})
public class ApplicationIntegrationTest {

    @Test
    public void contextLoads() {
        // This test will pass if the Spring context loads successfully
        assertTrue(true, "Application context should load without errors");
    }
    
    @Test
    public void serviceMethodsExist() throws NoSuchMethodException {
        // Verify that our new methods exist in the service classes
        
        // Check HabitService has the new move/copy methods
        HabitService.class.getMethod("moveHabitToFolder", Long.class, Long.class);
        HabitService.class.getMethod("copyHabitToFolder", Long.class, Long.class);
        
        // Check HabitFolderService has the required methods
        HabitFolderService.class.getMethod("getFolderTree");
        HabitFolderService.class.getMethod("createFolder", HabitFolderDTO.class);
        HabitFolderService.class.getMethod("updateFolder", Long.class, HabitFolderDTO.class);
        HabitFolderService.class.getMethod("deleteFolder", Long.class);
        HabitFolderService.class.getMethod("searchFolders", String.class);
        
        assertTrue(true, "All required service methods exist");
    }
}