package com.movieticketbooking.movieflix.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/movies")
public class MovieController {

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/now-playing")
    public ResponseEntity<Map<String, Object>> getNowPlayingMovies(@RequestParam(defaultValue = "1") int page) {
        String moviesUrl = "https://api.themoviedb.org/3/movie/now_playing?api_key=" + tmdbApiKey +
                "&language=en-US&region=IN&page=" + page;

        String genresUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key=" + tmdbApiKey + "&language=en-US";

        Map<String, Object> movieResponse = restTemplate.getForObject(moviesUrl, Map.class);
        Map<String, Object> genreResponse = restTemplate.getForObject(genresUrl, Map.class);

        List<Map<String, Object>> genresList = (List<Map<String, Object>>) genreResponse.get("genres");
        Map<Integer, String> genreMap = new HashMap<>();

        for (Map<String, Object> genre : genresList) {
            genreMap.put((Integer) genre.get("id"), (String) genre.get("name"));
        }

        List<Map<String, Object>> movies = (List<Map<String, Object>>) movieResponse.get("results");

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
        }

        return ResponseEntity.ok(movieResponse);
    }
}
