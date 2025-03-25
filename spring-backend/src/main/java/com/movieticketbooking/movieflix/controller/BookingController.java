package com.movieticketbooking.movieflix.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/booking")
public class BookingController {

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${google.api.key}")
    private String googleApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/details")
    public ResponseEntity<Map<String, Object>> getBookingDetails(
            @RequestParam String movieId,
            @RequestParam String theaterId) {

        Map<String, Object> movieDetails = fetchMovieDetails(movieId);
        Map<String, Object> theaterDetails = fetchTheaterDetails(theaterId);

        if (movieDetails == null || theaterDetails == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(buildBookingResponse(movieDetails, theaterDetails));
    }

    private Map<String, Object> fetchMovieDetails(String movieId) {
        String movieUrl = String.format(
                "https://api.themoviedb.org/3/movie/%s?api_key=%s&language=en-US",
                movieId, tmdbApiKey
        );
        return restTemplate.getForObject(movieUrl, Map.class);
    }

    private Map<String, Object> fetchTheaterDetails(String theaterId) {
        String theaterUrl = String.format(
                "https://places.googleapis.com/v1/places/%s?key=%s",
                theaterId, googleApiKey
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Goog-FieldMask", "displayName,formattedAddress,rating");
        return restTemplate.exchange(
                theaterUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        ).getBody();
    }

    private Map<String, Object> buildBookingResponse(
            Map<String, Object> movieDetails,
            Map<String, Object> theaterDetails) {

        Map<String, Object> response = new HashMap<>();

        response.put("movie", Map.of(
                "name", movieDetails.get("title"),
                "posterPath", buildPosterPath(movieDetails.get("poster_path")),
                "releaseDate", movieDetails.get("release_date"),
                "genres", extractGenres(movieDetails),
                "rating", movieDetails.getOrDefault("vote_average", "N/A"),
                "synopsis", movieDetails.get("overview")
        ));

        response.put("theater", Map.of(
                "name", extractTheaterName(theaterDetails),
                "address", theaterDetails.getOrDefault("formattedAddress", "Unknown Location"),
                "rating", theaterDetails.getOrDefault("rating", "N/A")
        ));

        return response;
    }

    private String buildPosterPath(Object posterPath) {
        return posterPath != null ?
                "https://image.tmdb.org/t/p/w500" + posterPath : null;
    }

    private List<String> extractGenres(Map<String, Object> movieDetails) {
        return ((List<Map<String, Object>>) movieDetails.get("genres")).stream()
                .map(g -> (String) g.get("name"))
                .collect(Collectors.toList());
    }

    private String extractTheaterName(Map<String, Object> theaterDetails) {
        if (theaterDetails.get("displayName") == null) {
            return "Unknown Theatre";
        }
        return ((Map<String, Object>) theaterDetails.get("displayName")).get("text").toString();
    }
}