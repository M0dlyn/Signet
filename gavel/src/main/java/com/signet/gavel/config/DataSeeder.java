package com.signet.gavel.config;

import com.signet.gavel.model.Auction;
import com.signet.gavel.repository.AuctionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AuctionRepository auctionRepository;

    public DataSeeder(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        List<Auction> seeds = List.of(
                newAuction("item-1", "Antique Vase", 100.0),
                newAuction("item-2", "Vintage Watch", 250.0),
                newAuction("item-3", "Rare First Edition", 180.0),
                newAuction("item-4", "Abstract Painting", 500.0),
                newAuction("item-5", "Signed Guitar", 750.0));

        for (Auction seed : seeds) {
            if (!auctionRepository.existsById(seed.getId())) {
                auctionRepository.save(seed);
                System.out.println("Seeded Auction: " + seed.getId() + " - " + seed.getItem());
            }
        }
    }

    private Auction newAuction(String id, String item, double price) {
        Auction a = new Auction();
        a.setId(id);
        a.setItem(item);
        a.setCurrentPrice(price);
        return a;
    }
}
