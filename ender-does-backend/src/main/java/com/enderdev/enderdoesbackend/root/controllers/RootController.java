package com.enderdev.enderdoesbackend.root.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    @Operation(
            summary = "Root Endpoint",
            description = "Returns a message indicating that the EnderDoes API server is running successfully."
    )
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("EnderDoes API Server Running successfully!");
    }

}