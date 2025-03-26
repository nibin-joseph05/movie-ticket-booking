package com.movieticketbooking.movieflix.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(nullable = false)
    private LocalDateTime bookingTime;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private String paymentStatus;

    private String paymentId;

    @Column(nullable = false)
    private String bookingReference;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookedSeat> seats;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FoodOrder> foodOrders;

    // Constructors
    public Booking() {
        this.bookingTime = LocalDateTime.now();
        this.paymentStatus = "PENDING";
        this.bookingReference = generateBookingReference();
    }

    public Booking(User user, Showtime showtime, double totalAmount) {
        this();
        this.user = user;
        this.showtime = showtime;
        this.totalAmount = totalAmount;
    }

    // Helper method to generate booking reference
    private String generateBookingReference() {
        return "BK-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Showtime getShowtime() {
        return showtime;
    }

    public void setShowtime(Showtime showtime) {
        this.showtime = showtime;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public List<BookedSeat> getSeats() {
        return seats;
    }

    public void setSeats(List<BookedSeat> seats) {
        this.seats = seats;
    }

    public List<FoodOrder> getFoodOrders() {
        return foodOrders;
    }

    public void setFoodOrders(List<FoodOrder> foodOrders) {
        this.foodOrders = foodOrders;
    }

    // Helper methods for bidirectional relationships
    public void addSeat(BookedSeat seat) {
        seats.add(seat);
        seat.setBooking(this);
    }

    public void removeSeat(BookedSeat seat) {
        seats.remove(seat);
        seat.setBooking(null);
    }

    public void addFoodOrder(FoodOrder foodOrder) {
        foodOrders.add(foodOrder);
        foodOrder.setBooking(this);
        this.totalAmount = calculateTotalAmount();
    }

    public void setPayment(Payment payment) {
        if (payment == null) {
            if (this.payment != null) {
                this.payment.setBooking(null);
            }
        } else {
            payment.setBooking(this);
        }
        this.payment = payment;
    }

    private double calculateTotalAmount() {
        double seatsTotal = seats.stream().mapToDouble(BookedSeat::getPrice).sum();
        double foodTotal = foodOrders.stream()
                .mapToDouble(FoodOrder::getSubtotal)
                .sum();
        return seatsTotal + foodTotal;
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", bookingTime=" + bookingTime +
                ", totalAmount=" + totalAmount +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", bookingReference='" + bookingReference + '\'' +
                '}';
    }



}