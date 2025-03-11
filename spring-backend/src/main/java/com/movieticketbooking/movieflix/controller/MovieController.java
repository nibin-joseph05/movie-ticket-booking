package com.movieticketbooking.movieflix.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/movies")
public class MovieController {

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/now-playing")
    public ResponseEntity<Map<String, Object>> getNowPlayingMovies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String language) {

        String lang = language != null ? language : "en-US";
        String region = "IN";

        String moviesUrl = "https://api.themoviedb.org/3/movie/now_playing?api_key=" + tmdbApiKey +
                "&language=" + lang + "&region=" + region + "&page=" + page;

        String genresUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key=" + tmdbApiKey + "&language=en-US";

        Map<String, Object> movieResponse = restTemplate.getForObject(moviesUrl, Map.class);
        Map<String, Object> genreResponse = restTemplate.getForObject(genresUrl, Map.class);

        List<Map<String, Object>> genresList = (List<Map<String, Object>>) genreResponse.get("genres");
        Map<Integer, String> genreMap = genresList.stream()
                .collect(Collectors.toMap(g -> (Integer) g.get("id"), g -> (String) g.get("name")));

        List<Map<String, Object>> movies = (List<Map<String, Object>>) movieResponse.get("results");

        // Process movies and add genre names
        List<Map<String, Object>> filteredMovies = new ArrayList<>();

        for (Map<String, Object> movie : movies) {
            List<Integer> genreIds = (List<Integer>) movie.get("genre_ids");
            StringBuilder genreNames = new StringBuilder();

            for (Integer genreId : genreIds) {
                if (genreMap.containsKey(genreId)) {
                    genreNames.append(genreMap.get(genreId)).append(", ");
                }
            }
            if (genreNames.length() > 0) {
                genreNames.setLength(genreNames.length() - 2);
            }
            movie.put("genres", genreNames.toString());

            // Apply Filters
            boolean matchesGenre = (genre == null || Arrays.asList(genreNames.toString().split(", ")).contains(genre));
            boolean matchesLanguage = (language == null || language.equalsIgnoreCase((String) movie.get("original_language")));

            if (matchesGenre && matchesLanguage) {
                filteredMovies.add(movie);
            }
        }

        movieResponse.put("results", filteredMovies);
        return ResponseEntity.ok(movieResponse);
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getGenres() {
        String genresUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key=" + tmdbApiKey + "&language=en-US";
        Map<String, Object> genreResponse = restTemplate.getForObject(genresUrl, Map.class);

        if (genreResponse == null || !genreResponse.containsKey("genres")) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Map<String, Object>> genresList = (List<Map<String, Object>>) genreResponse.get("genres");
        List<String> genreNames = genresList.stream()
                .map(g -> (String) g.get("name"))
                .collect(Collectors.toList());

        return ResponseEntity.ok(genreNames);
    }


}
