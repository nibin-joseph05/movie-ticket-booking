package com.movieticketbooking.movieflix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.movieticketbooking.movieflix.models.Showtime;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByTheatreIdAndMovieIdAndDate(String theatreId, Long movieId, LocalDate date);
}
