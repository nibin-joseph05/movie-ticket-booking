package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingReference(String bookingReference);

    @Query("SELECT bs.seatNumber FROM Booking b JOIN b.seats bs WHERE b.showtime.id = :showtimeId")
    List<String> findBookedSeatsByShowtime(Long showtimeId);
}