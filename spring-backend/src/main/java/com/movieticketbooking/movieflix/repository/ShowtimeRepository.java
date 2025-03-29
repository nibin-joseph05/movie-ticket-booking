package com.movieticketbooking.movieflix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.movieticketbooking.movieflix.models.Showtime;

import java.time.LocalDate;
import java.util.Optional;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    Optional<Showtime> findByMovieIdAndTheatreIdAndDateAndTime(
            Long movieId,
            String theatreId,
            LocalDate date,
            String time
    );


}
