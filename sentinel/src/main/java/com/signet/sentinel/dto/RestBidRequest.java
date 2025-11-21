package com.signet.sentinel.dto;

import lombok.Data;

@Data
public class RestBidRequest {
    private String auctionId;
    private Double amount;
    private Long timestamp;
    private String signature; // Base64 encoded
}
