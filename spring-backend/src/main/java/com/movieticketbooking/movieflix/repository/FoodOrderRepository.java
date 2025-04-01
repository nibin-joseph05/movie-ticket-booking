package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.Booking;
import com.movieticketbooking.movieflix.models.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {
    List<FoodOrder> findByBookingId(Long bookingId);
    List<FoodOrder> findByBooking(Booking booking);
}