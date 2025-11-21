package com.signet.gavel.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
