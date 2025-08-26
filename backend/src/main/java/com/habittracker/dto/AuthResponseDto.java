package com.habittracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for authentication responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDto {

    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private String username;
    private String email;
    private String firstName;
    private String lastName;

    public AuthResponseDto(String accessToken, String username, String email, String firstName, String lastName) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
