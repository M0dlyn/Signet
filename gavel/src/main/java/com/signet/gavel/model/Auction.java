package com.signet.gavel.model;

import jakarta.persistence.*;

@Entity
@Table(name = "auctions")
public class Auction {

    @Id
    private String id; // Using String ID as per proto (e.g. "item-1")

    @Column(nullable = false)
    private String item;

    @Column(nullable = false)
    private Double currentPrice;

    private String highestBidderId;

    @Version // Optimistic Locking
    private Long version;

    public Auction() {
    }

    public Auction(String id, String item, Double currentPrice, String highestBidderId, Long version) {
        this.id = id;
        this.item = item;
        this.currentPrice = currentPrice;
        this.highestBidderId = highestBidderId;
        this.version = version;
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

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public String getHighestBidderId() {
        return highestBidderId;
    }

    public void setHighestBidderId(String highestBidderId) {
        this.highestBidderId = highestBidderId;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
