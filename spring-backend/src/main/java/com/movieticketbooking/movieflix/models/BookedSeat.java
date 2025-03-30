package com.movieticketbooking.movieflix.models;

import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name = "booked_seats")
public class BookedSeat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatCategory category;

    @Column(nullable = false)
    private double price;

    // Updated methods to match new Showtime structure
    public Long getMovieId() {
        return booking.getShowtime().getMovieId();
    }

    public String getTheatreId() {
        return booking.getShowtime().getTheatreId();
    }

    public LocalDate getShowDate() {
        return booking.getShowtime().getDate();
    }

    public String getShowTime() {
        return booking.getShowtime().getTime();
    }

    private double getSeatPrice(Showtime showtime, String seatNumber) {
        if (seatNumber.startsWith("S")) return showtime.getSilverPrice();
        if (seatNumber.startsWith("G")) return showtime.getGoldPrice();
        if (seatNumber.startsWith("P")) return showtime.getPlatinumPrice();
        return showtime.getSilverPrice(); // default
    }

    public enum SeatCategory {
        SILVER, GOLD, PLATINUM
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public SeatCategory getCategory() {
        return category;
    }

    public void setCategory(SeatCategory category) {
        this.category = category;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}