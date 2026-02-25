package com.signet.sentinel.controller;

import com.signet.grpc.AuctionState;
import com.signet.sentinel.service.BidService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "http://localhost:5173")
public class AuctionController {

    private final BidService bidService;

    public AuctionController(BidService bidService) {
        this.bidService = bidService;
    }

    @GetMapping
    public ResponseEntity<?> listAuctions() {
        try {
            List<AuctionStateDto> auctions = bidService.listAuctions().stream()
                    .map(s -> new AuctionStateDto(s.getId(), s.getItem(), s.getCurrentPrice(), s.getHighestBidderId()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(auctions);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to list auctions: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAuctionState(@PathVariable String id) {
        try {
            AuctionState state = bidService.getAuctionState(id);
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
