package com.movieticketbooking.movieflix.models;

import java.time.LocalDate;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.movieticketbooking.movieflix.models.Movie;
import com.movieticketbooking.movieflix.models.Theatre;

@Entity
@Table(name = "showtimes")
public class Showtime {

    public Showtime(){}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "theatre_id", referencedColumnName = "id", nullable = false)
    private Theatre theatre;

    @NotNull
    private LocalDate date;

    @NotNull
    private String time;

    @NotNull
    private int silverSeatsAvailable = 40;

    @NotNull
    private int goldSeatsAvailable = 20;

    @NotNull
    private int platinumSeatsAvailable = 10;

    @NotNull
    private double silverPrice = 140.0;

    @NotNull
    private double goldPrice = 170.0;

    @NotNull
    private double platinumPrice = 210.0;

    public Long getId() {
        return id;
    }

    public double getSilverPrice() {
        return silverPrice;
    }

    public void setSilverPrice(double silverPrice) {
        this.silverPrice = silverPrice;
    }

    public double getGoldPrice() {
        return goldPrice;
    }

    public void setGoldPrice(double goldPrice) {
        this.goldPrice = goldPrice;
    }

    public double getPlatinumPrice() {
        return platinumPrice;
    }

    public void setPlatinumPrice(double platinumPrice) {
        this.platinumPrice = platinumPrice;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Theatre getTheatre() {
        return theatre;
    }

    public void setTheatre(Theatre theatre) {
        this.theatre = theatre;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public int getSilverSeatsAvailable() {
        return silverSeatsAvailable;
    }

    public void setSilverSeatsAvailable(int silverSeatsAvailable) {
        this.silverSeatsAvailable = silverSeatsAvailable;
    }

    public int getGoldSeatsAvailable() {
        return goldSeatsAvailable;
    }

    public void setGoldSeatsAvailable(int goldSeatsAvailable) {
        this.goldSeatsAvailable = goldSeatsAvailable;
    }

    public int getPlatinumSeatsAvailable() {
        return platinumSeatsAvailable;
    }

    public void setPlatinumSeatsAvailable(int platinumSeatsAvailable) {
        this.platinumSeatsAvailable = platinumSeatsAvailable;
    }
}
