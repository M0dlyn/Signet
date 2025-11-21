package com.signet.sentinel.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password; // This will be hashed by the client? No, spec says "Client sends... hashed
                             // password"?
    // Wait, spec says: "Client sends the Public Key to the server along with the
    // hashed password."
    // AND "Server uses BCrypt (Salted Hashing) to verify passwords".
    // Usually client sends raw password over TLS, server hashes it.
    // If client hashes it, it's just a different "raw" password to the server.
    // Let's stick to standard: Client sends password (over TLS), Server hashes it
    // with BCrypt.
    // Re-reading spec: "Client sends the Public Key to the server along with the
    // hashed password."
    // "Server uses BCrypt (Salted Hashing) to verify passwords".
    // If client sends hashed password, server can't salt it properly unless client
    // does the salting?
    // I will assume Client sends "password" (maybe pre-hashed or raw), and Server
    // BCrypts it for storage.
    // Let's assume standard flow: Client -> TLS -> Server (BCrypt) -> DB.

    private String publicKey;
}
