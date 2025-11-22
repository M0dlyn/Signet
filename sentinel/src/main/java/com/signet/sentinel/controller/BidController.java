package com.signet.sentinel.controller;

import com.signet.sentinel.dto.RestBidRequest;
import com.signet.sentinel.service.BidService;
import com.signet.sentinel.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "http://localhost:5173")
public class BidController {

    private final BidService bidService;
    private final JwtUtil jwtUtil;

    public BidController(BidService bidService, JwtUtil jwtUtil) {
        this.bidService = bidService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> placeBid(
            @RequestHeader("Authorization") String token,
            @RequestBody RestBidRequest request) {

        try {
            String jwt = token.substring(7); // Remove "Bearer "
            String username = jwtUtil.extractUsername(jwt);

            String result = bidService.placeBid(username, request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Invalid Digital Signature")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An unexpected error occurred");
        }
    }
}
