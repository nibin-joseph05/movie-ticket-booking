package com.movieticketbooking.movieflix.dto;

import java.time.LocalDate;
import com.movieticketbooking.movieflix.models.Booking;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


public record BookingDetailsDTO(
        String bookingReference,
        String userName,
        String userEmail,
        LocalDateTime bookingTime,
        ShowtimeInfo showtime,
        List<SeatInfo> seats,
        List<FoodItemInfo> foodOrders,
        PaymentInfo payment
) {
    public static BookingDetailsDTO fromEntity(Booking booking) {
        return new BookingDetailsDTO(
                booking.getBookingReference(),
                // Handle potential null user
                booking.getUser() != null ?
                        booking.getUser().getFirstName() + " " + booking.getUser().getLastName() : "—",
                booking.getUser() != null ? booking.getUser().getEmail() : "—",
                booking.getBookingTime(),
                // Handle null showtime
                booking.getShowtime() != null ? new ShowtimeInfo(
                        booking.getShowtime().getMovieId(),
                        booking.getShowtime().getTheatreId(),
                        booking.getShowtime().getDate(),
                        booking.getShowtime().getTime()
                ) : null,
                // Handle empty seats
                booking.getSeats() != null ? booking.getSeats().stream()
                        .map(s -> new SeatInfo(s.getSeatNumber(), s.getCategory().name()))
                        .collect(Collectors.toList()) : Collections.emptyList(),
                // Handle empty food orders
                booking.getFoodOrders() != null ? booking.getFoodOrders().stream()
                        .map(f -> new FoodItemInfo(
                                f.getFoodItem().getName(),
                                f.getQuantity(),
                                f.getPriceAtOrder()
                        ))
                        .collect(Collectors.toList()) : Collections.emptyList(),
                // Handle null payment
                booking.getPayment() != null ? new PaymentInfo(
                        booking.getPayment().getTransactionId(),
                        booking.getPayment().getAmount(),
                        booking.getPayment().getStatus().name()
                ) : null
        );
    }

    // Nested DTOs
    public record ShowtimeInfo(Long movieId, String theatreId, LocalDate date, String time) {}
    public record SeatInfo(String seatNumber, String category) {}
    public record FoodItemInfo(String name, int quantity, double priceAtOrder) {}
    public record PaymentInfo(String transactionId, double amount, String status) {}
}