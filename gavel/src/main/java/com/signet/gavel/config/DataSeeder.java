package com.signet.gavel.config;

import com.signet.gavel.model.Auction;
import com.signet.gavel.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AuctionRepository auctionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (auctionRepository.count() == 0) {
            Auction auction = new Auction();
            auction.setId("item-1");
            auction.setItem("Antique Vase");
            auction.setCurrentPrice(100.0);
            auctionRepository.save(auction);
            System.out.println("Seeded Auction: item-1");
        }
    }
}
