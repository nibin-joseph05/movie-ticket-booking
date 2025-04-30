package com.movieticketbooking.movieflix.dto;

import java.time.LocalDateTime;
import com.movieticketbooking.movieflix.models.Booking;

public record BookingListDTO(
        String bookingReference,
        LocalDateTime bookingTime,
        String userName,
        String userEmail,
        double totalAmount,
        String paymentStatus
) {
    public static BookingListDTO fromEntity(Booking booking) {
        return new BookingListDTO(
                booking.getBookingReference(),
                booking.getBookingTime(),
                booking.getUser().getFirstName() + " " + booking.getUser().getLastName(),
                booking.getUser().getEmail(),
                booking.getTotalAmount(),
                booking.getPayment() != null ? booking.getPayment().getStatus().name() : "PENDING"
        );
    }
}