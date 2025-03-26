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

    public Movie getMovie() {
        return booking.getShowtime().getMovie();
    }

    public Theatre getTheatre() {
        return booking.getShowtime().getTheatre();
    }

    public LocalDate getShowDate() {
        return booking.getShowtime().getDate();
    }

    public String getShowTime() {
        return booking.getShowtime().getTime();
    }

    public enum SeatCategory {
        SILVER, GOLD, PLATINUM
    }

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