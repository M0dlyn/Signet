package com.signet.sentinel.controller;

import com.signet.grpc.AuctionState;
import com.signet.sentinel.service.BidService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "http://localhost:5173")
public class AuctionController {

    private final BidService bidService;

    public AuctionController(BidService bidService) {
        this.bidService = bidService;
    }

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

    static class AuctionStateDto {
        private String id;
        private String item;
        private double currentPrice;
        private String highestBidderId;

        public AuctionStateDto(String id, String item, double currentPrice, String highestBidderId) {
            this.id = id;
            this.item = item;
            this.currentPrice = currentPrice;
            this.highestBidderId = highestBidderId;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getItem() {
            return item;
        }

        public void setItem(String item) {
            this.item = item;
        }

        public double getCurrentPrice() {
            return currentPrice;
        }

        public void setCurrentPrice(double currentPrice) {
            this.currentPrice = currentPrice;
        }

        public String getHighestBidderId() {
            return highestBidderId;
        }

        public void setHighestBidderId(String highestBidderId) {
            this.highestBidderId = highestBidderId;
        }
    }
}
