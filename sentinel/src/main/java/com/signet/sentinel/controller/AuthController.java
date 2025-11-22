package com.signet.sentinel.controller;

import com.signet.sentinel.dto.RegisterRequest;
import com.signet.sentinel.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allow React app
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<com.signet.sentinel.dto.LoginResponse> login(
            @RequestBody com.signet.sentinel.dto.LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new com.signet.sentinel.dto.LoginResponse(token));
    }
}
