package com.movieticketbooking.movieflix.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "movies")
public class Movie {

    public Movie() {}

    public Movie(Long id, String title) {
        this.id = id;
        this.title = title;
    }

    @Id
    @NotNull(message = "Movie ID (TMDB ID) is required")
    private Long id;

    @NotNull(message = "Movie title is required")
    private String title;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    @Override
    public String toString() {
        return "Movie{" +
                "id=" + id +
                ", title='" + title + '\'' +
                '}';
    }
}
