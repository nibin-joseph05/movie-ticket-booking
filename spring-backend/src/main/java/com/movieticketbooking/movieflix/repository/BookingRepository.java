package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingReference(String bookingReference);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.bookingTime DESC")
    List<Booking> findByUserId(Long userId);

    @Query("SELECT b FROM Booking b " +
            "WHERE LOWER(b.user.email) LIKE LOWER(:search) OR " +
            "LOWER(b.user.firstName) LIKE LOWER(:search) OR " +
            "LOWER(b.user.lastName) LIKE LOWER(:search) OR " +
            "LOWER(b.bookingReference) LIKE LOWER(:search)")
    Page<Booking> findBasicBookings(@Param("search") String search, Pageable pageable);

    // Detailed query (with joins)
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.seats " +
            "LEFT JOIN FETCH b.payment " +
            "LEFT JOIN FETCH b.user " +
            "LEFT JOIN FETCH b.showtime " +
            "WHERE b.bookingReference = :reference")
    Optional<Booking> findDetailedBooking(@Param("reference") String reference);

    // Add separate query for food orders
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.foodOrders fo " +
            "LEFT JOIN FETCH fo.foodItem " +
            "WHERE b.bookingReference = :reference")
    Optional<Booking> findWithFoodOrders(@Param("reference") String reference);
}