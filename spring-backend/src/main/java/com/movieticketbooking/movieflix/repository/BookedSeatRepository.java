
package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.BookedSeat;
import com.movieticketbooking.movieflix.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookedSeatRepository extends JpaRepository<BookedSeat, Long> {
    List<BookedSeat> findByBookingId(Long bookingId);
    List<BookedSeat> findByBooking(Booking booking);

    @Query("SELECT bs.seatNumber FROM BookedSeat bs " +
            "JOIN bs.booking b " +
            "JOIN b.showtime s " +
            "WHERE s.theatreId = :theaterId " +
            "AND s.time = :showtime " +
            "AND s.date = :date")
    List<String> findBookedSeatsByTheaterShowtimeAndDate(
            @Param("theaterId") String theaterId,
            @Param("showtime") String showtime,
            @Param("date") LocalDate date);
}