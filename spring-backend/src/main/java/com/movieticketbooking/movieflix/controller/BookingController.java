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
            @RequestParam String theaterId
    ) {
        // Fetch movie details from TMDB
        String movieUrl = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=" + tmdbApiKey + "&language=en-US";
        Map<String, Object> movieDetails = restTemplate.getForObject(movieUrl, Map.class);

        // Fetch theater details from Google Places API
        String theaterUrl = "https://places.googleapis.com/v1/places/" + theaterId + "?key=" + googleApiKey;

        // Set headers for Google Places API request
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Goog-FieldMask", "displayName,formattedAddress,rating"); // Specify the fields you need
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // Make the request to Google Places API
        Map<String, Object> theaterDetails = restTemplate.exchange(theaterUrl, HttpMethod.GET, entity, Map.class).getBody();

        if (movieDetails == null || theaterDetails == null) {
            return ResponseEntity.notFound().build();
        }

        // Build the response
        Map<String, Object> response = new HashMap<>();
        response.put("movie", Map.of(
                "name", movieDetails.get("title"), // Use "title" from TMDB
                "posterPath", movieDetails.get("poster_path") != null ? "https://image.tmdb.org/t/p/w500" + movieDetails.get("poster_path") : null,
                "releaseDate", movieDetails.get("release_date"),
                "genres", ((List<Map<String, Object>>) movieDetails.get("genres")).stream()
                        .map(g -> (String) g.get("name"))
                        .collect(Collectors.toList()),
                "rating", movieDetails.get("vote_average") != null ? movieDetails.get("vote_average") : "N/A",
                "synopsis", movieDetails.get("overview")
        ));

        response.put("theater", Map.of(
                "name", theaterDetails.get("displayName") != null ? ((Map<String, Object>) theaterDetails.get("displayName")).get("text") : "Unknown Theatre",
                "address", theaterDetails.get("formattedAddress") != null ? theaterDetails.get("formattedAddress") : "Unknown Location",
                "rating", theaterDetails.get("rating") != null ? theaterDetails.get("rating") : "N/A"
        ));

        return ResponseEntity.ok(response);
    }
}