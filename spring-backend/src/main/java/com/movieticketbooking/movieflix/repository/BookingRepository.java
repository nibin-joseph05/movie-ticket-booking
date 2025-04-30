package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.dto.MonthlyProfit;
import com.movieticketbooking.movieflix.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
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


    @Query("SELECT COALESCE(SUM(s.price), 0) FROM Booking b JOIN b.seats s " +
            "WHERE b.bookingTime BETWEEN :start AND :end")
    Double sumTicketSalesByDateRange(@Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(fo.quantity * fo.priceAtOrder), 0) FROM Booking b JOIN b.foodOrders fo " +
            "WHERE b.bookingTime BETWEEN :start AND :end")
    Double sumFoodSalesByDateRange(@Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    @Query("SELECT NEW com.movieticketbooking.movieflix.dto.MonthlyProfit(" +
            "TO_CHAR(b.bookingTime, 'YYYY-MM'), " +
            "COALESCE(SUM(s.price), 0.0), " +  // Ensure numeric default
            "COALESCE(SUM(fo.quantity * fo.priceAtOrder), 0.0)) " +  // Ensure numeric default
            "FROM Booking b " +
            "LEFT JOIN b.seats s " +
            "LEFT JOIN b.foodOrders fo " +
            "GROUP BY TO_CHAR(b.bookingTime, 'YYYY-MM') " +
            "ORDER BY TO_CHAR(b.bookingTime, 'YYYY-MM') DESC")
    List<MonthlyProfit> getMonthlyProfitTrend();
}