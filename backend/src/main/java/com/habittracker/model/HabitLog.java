package com.habittracker.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

/**
 * Entity representing a single completion of a habit on a specific day.
 */
@Entity
@Table(name = "habit_logs", uniqueConstraints = @UniqueConstraint(columnNames = { "habit_id", "completion_date" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;
}
