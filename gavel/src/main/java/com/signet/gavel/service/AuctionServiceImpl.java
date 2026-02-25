package com.signet.gavel.service;

import com.signet.gavel.model.Auction;
import com.signet.gavel.repository.AuctionRepository;
import com.signet.grpc.AuctionServiceGrpc;
import com.signet.grpc.BidRequest;
import com.signet.grpc.BidResponse;
import com.signet.grpc.AuctionId;
import com.signet.grpc.AuctionState;
import com.signet.grpc.ListAuctionsRequest;
import com.signet.grpc.ListAuctionsResponse;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@GrpcService
public class AuctionServiceImpl extends AuctionServiceGrpc.AuctionServiceImplBase {

    private final AuctionRepository auctionRepository;

    public AuctionServiceImpl(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }

    @Override
    @Transactional
    public void placeBid(BidRequest request, StreamObserver<BidResponse> responseObserver) {
        try {
            Auction auction = auctionRepository.findById(request.getAuctionId())
                    .orElseThrow(() -> new RuntimeException("Auction not found"));

            if (request.getAmount() <= auction.getCurrentPrice()) {
                responseObserver.onNext(BidResponse.newBuilder()
                        .setSuccess(false)
                        .setMessage("Bid amount must be higher than current price")
                        .setCurrentPrice(auction.getCurrentPrice())
                        .build());
                responseObserver.onCompleted();
                return;
            }

            auction.setCurrentPrice(request.getAmount());
            auction.setHighestBidderId(request.getUserId());
            auctionRepository.save(auction);

            responseObserver.onNext(BidResponse.newBuilder()
                    .setSuccess(true)
                    .setMessage("Bid accepted")
                    .setCurrentPrice(auction.getCurrentPrice())
                    .build());
            responseObserver.onCompleted();

        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            responseObserver.onNext(BidResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage("Bid rejected: Someone placed a bid at the same time. Please retry.")
                    .setCurrentPrice(0.0)
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onNext(BidResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage("Error: " + e.getMessage())
                    .build());
            responseObserver.onCompleted();
        }
    }

    @Override
    public void getAuctionState(AuctionId request, StreamObserver<AuctionState> responseObserver) {
        auctionRepository.findById(request.getId()).ifPresentOrElse(
                auction -> {
                    responseObserver.onNext(AuctionState.newBuilder()
                            .setId(auction.getId())
                            .setItem(auction.getItem())
                            .setCurrentPrice(auction.getCurrentPrice())
                            .setHighestBidderId(
                                    auction.getHighestBidderId() == null ? "" : auction.getHighestBidderId())
                            .build());
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(new RuntimeException("Auction not found")));
    }

    @Override
    public void listAuctions(ListAuctionsRequest request, StreamObserver<ListAuctionsResponse> responseObserver) {
        List<AuctionState> states = auctionRepository.findAll().stream()
                .map(auction -> AuctionState.newBuilder()
                        .setId(auction.getId())
                        .setItem(auction.getItem())
                        .setCurrentPrice(auction.getCurrentPrice())
                        .setHighestBidderId(auction.getHighestBidderId() == null ? "" : auction.getHighestBidderId())
                        .build())
                .collect(Collectors.toList());

        responseObserver.onNext(ListAuctionsResponse.newBuilder()
                .addAllAuctions(states)
                .build());
        responseObserver.onCompleted();
    }
}
