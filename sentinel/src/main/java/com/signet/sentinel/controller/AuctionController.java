package com.signet.sentinel.controller;

import com.signet.grpc.AuctionState;
import com.signet.grpc.CreateAuctionResponse;
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

    @PostMapping
    public ResponseEntity<?> createAuction(@RequestBody CreateAuctionRequestDto body,
            org.springframework.security.core.Authentication authentication) {
        try {
            if (body.getItem() == null || body.getItem().isBlank()) {
                return ResponseEntity.badRequest().body("Item name is required.");
            }
            if (body.getStartingPrice() <= 0) {
                return ResponseEntity.badRequest().body("Starting price must be greater than 0.");
            }
            // Auto-generate a URL-safe ID from the item name
            String id = body.getItem().toLowerCase()
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("(^-|-$)", "");
            // Append timestamp suffix to ensure uniqueness
            id = id + "-" + (System.currentTimeMillis() % 100000);

            String creatorId = authentication.getName();
            CreateAuctionResponse grpcResp = bidService.createAuction(id, body.getItem(), body.getStartingPrice(),
                    creatorId);
            if (!grpcResp.getSuccess()) {
                return ResponseEntity.badRequest().body(grpcResp.getMessage());
            }
            return ResponseEntity.ok(new AuctionStateDto(
                    grpcResp.getAuctionId(),
                    grpcResp.getItem(),
                    grpcResp.getCurrentPrice(),
                    "",
                    creatorId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create auction: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listAuctions() {
        try {
            List<AuctionStateDto> auctions = bidService.listAuctions().stream()
                    .map(s -> new AuctionStateDto(s.getId(), s.getItem(), s.getCurrentPrice(), s.getHighestBidderId(),
                            s.getCreatorId()))
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
                    state.getHighestBidderId(),
                    state.getCreatorId()));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Auction not found");
        }
    }

    static class AuctionStateDto {
        private String id;
        private String item;
        private double currentPrice;
        private String highestBidderId;
        private String creatorId;

        public AuctionStateDto(String id, String item, double currentPrice, String highestBidderId, String creatorId) {
            this.id = id;
            this.item = item;
            this.currentPrice = currentPrice;
            this.highestBidderId = highestBidderId;
            this.creatorId = creatorId;
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

        public String getCreatorId() {
            return creatorId;
        }

        public void setCreatorId(String creatorId) {
            this.creatorId = creatorId;
        }
    }

    static class CreateAuctionRequestDto {
        private String item;
        private double startingPrice;

        public String getItem() {
            return item;
        }

        public void setItem(String item) {
            this.item = item;
        }

        public double getStartingPrice() {
            return startingPrice;
        }

        public void setStartingPrice(double startingPrice) {
            this.startingPrice = startingPrice;
        }
    }
}
