package com.movieticketbooking.movieflix.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "food_orders")
public class FoodOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantity;

    @NotNull
    @Column(nullable = false)
    private Double priceAtOrder; // Snapshot of price when ordered

    // Constructors
    public FoodOrder() {}

    public FoodOrder(Booking booking, FoodItem foodItem, Integer quantity) {
        this.booking = booking;
        this.foodItem = foodItem;
        this.quantity = quantity;
        this.priceAtOrder = foodItem.getPrice();
    }

    // Helper method to calculate subtotal
    public Double getSubtotal() {
        return priceAtOrder * quantity;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public FoodItem getFoodItem() { return foodItem; }
    public void setFoodItem(FoodItem foodItem) {
        this.foodItem = foodItem;
        if (priceAtOrder == null) {
            this.priceAtOrder = foodItem.getPrice();
        }
    }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getPriceAtOrder() { return priceAtOrder; }
    public void setPriceAtOrder(Double priceAtOrder) { this.priceAtOrder = priceAtOrder; }

}