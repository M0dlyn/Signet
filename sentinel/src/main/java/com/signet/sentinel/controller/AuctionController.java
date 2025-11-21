package com.signet.sentinel.controller;

import com.signet.grpc.AuctionState;
import com.signet.sentinel.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuctionController {

    private final BidService bidService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getAuctionState(@PathVariable String id) {
        try {
            AuctionState state = bidService.getAuctionState(id);
            // Convert Protobuf object to JSON-friendly response if needed,
            // but Spring Boot + Jackson usually handles Protobuf if configured,
            // or we return a DTO. For simplicity, let's return a DTO or map.
            // Protobuf objects have a lot of internal fields.
            // Let's return a simple Map or DTO.

            return ResponseEntity.ok(new AuctionStateDto(
                    state.getId(),
                    state.getItem(),
                    state.getCurrentPrice(),
                    state.getHighestBidderId()));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Auction not found");
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class AuctionStateDto {
        private String id;
        private String item;
        private double currentPrice;
        private String highestBidderId;
    }
}
