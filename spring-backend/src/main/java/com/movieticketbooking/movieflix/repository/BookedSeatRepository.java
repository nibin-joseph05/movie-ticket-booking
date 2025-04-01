
package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.BookedSeat;
import com.movieticketbooking.movieflix.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookedSeatRepository extends JpaRepository<BookedSeat, Long> {
    List<BookedSeat> findByBookingId(Long bookingId);
    List<BookedSeat> findByBooking(Booking booking);
}