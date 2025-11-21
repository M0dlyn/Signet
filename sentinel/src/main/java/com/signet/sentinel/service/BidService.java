package com.signet.sentinel.service;

import com.signet.grpc.AuctionServiceGrpc;
import com.signet.grpc.BidRequest;
import com.signet.grpc.BidResponse;
import com.signet.sentinel.dto.RestBidRequest;
import com.signet.sentinel.model.User;
import com.signet.sentinel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BidService {

    private final UserRepository userRepository;
    private final SignatureVerifier signatureVerifier;

    @GrpcClient("gavel-service")
    private AuctionServiceGrpc.AuctionServiceBlockingStub auctionServiceStub;

    public String placeBid(String username, RestBidRequest request) {
        // 1. Fetch User & Public Key
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Construct Payload for Verification
        // MUST MATCH CLIENT: auctionId:amount:timestamp
        String payload = request.getAuctionId() + ":" + request.getAmount() + ":" + request.getTimestamp();

        // 3. Verify Signature
        boolean isValid = signatureVerifier.verify(user.getPublicKeyPem(), payload, request.getSignature());
        if (!isValid) {
            throw new RuntimeException("Invalid Digital Signature. Integrity check failed.");
        }

        // 4. Forward to Gavel via gRPC
        BidRequest grpcRequest = BidRequest.newBuilder()
                .setAuctionId(request.getAuctionId())
                .setUserId(user.getUsername()) // Or ID
                .setAmount(request.getAmount())
                .setTimestamp(request.getTimestamp())
                .build();

        BidResponse response = auctionServiceStub.placeBid(grpcRequest);

        if (!response.getSuccess()) {
            throw new RuntimeException(response.getMessage());
        }

        return "Bid accepted. Current price: " + response.getCurrentPrice();
    }

    public com.signet.grpc.AuctionState getAuctionState(String auctionId) {
        return auctionServiceStub.getAuctionState(com.signet.grpc.AuctionId.newBuilder().setId(auctionId).build());
    }
}
