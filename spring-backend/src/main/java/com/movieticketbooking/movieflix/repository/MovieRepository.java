package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
}
