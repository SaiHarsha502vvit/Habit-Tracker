package com.habittracker.dto;

/**
 * DTO for authentication responses.
 */
public class AuthResponseDto {

    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String email;
    private String firstName;
    private String lastName;

    public AuthResponseDto() {
    }

    public AuthResponseDto(String accessToken, String username, String email, String firstName, String lastName) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public AuthResponseDto(String accessToken, String tokenType, String username, String email, String firstName,
            String lastName) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    // Builder pattern methods
    public static AuthResponseDto builder() {
        return new AuthResponseDto();
    }

    public AuthResponseDto accessToken(String accessToken) {
        this.accessToken = accessToken;
        return this;
    }

    public AuthResponseDto tokenType(String tokenType) {
        this.tokenType = tokenType;
        return this;
    }

    public AuthResponseDto username(String username) {
        this.username = username;
        return this;
    }

    public AuthResponseDto email(String email) {
        this.email = email;
        return this;
    }

    public AuthResponseDto firstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public AuthResponseDto lastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public AuthResponseDto build() {
        return this;
    }
}
