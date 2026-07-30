package com.enderdev.enderdoesbackend.user.dto;

public record UserUpdateRequest(
        String name,
        String imageUrl
) {
}
