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

    @GetMapping("/details")
    public ResponseEntity<Map<String, Object>> getMovieDetails(@RequestParam String id) {
        String movieUrl = "https://api.themoviedb.org/3/movie/" + id + "?api_key=" + tmdbApiKey + "&language=en-US";
        String creditsUrl = "https://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + tmdbApiKey;
        String videosUrl = "https://api.themoviedb.org/3/movie/" + id + "/videos?api_key=" + tmdbApiKey;
        String nowPlayingUrl = "https://api.themoviedb.org/3/movie/now_playing?api_key=" + tmdbApiKey + "&language=en-US&region=IN";

        Map<String, Object> movieDetails = restTemplate.getForObject(movieUrl, Map.class);
        Map<String, Object> creditsResponse = restTemplate.getForObject(creditsUrl, Map.class);
        Map<String, Object> videosResponse = restTemplate.getForObject(videosUrl, Map.class);
        Map<String, Object> nowPlayingResponse = restTemplate.getForObject(nowPlayingUrl, Map.class);

        if (movieDetails == null) {
            return ResponseEntity.notFound().build();
        }

        // Extracting essential details
        String posterPath = (String) movieDetails.get("poster_path");
        String releaseDate = (String) movieDetails.get("release_date");

        // Extracting genres as a list of names
        List<Map<String, Object>> genresList = (List<Map<String, Object>>) movieDetails.get("genres");
        List<String> genreNames = genresList.stream()
                .map(g -> (String) g.get("name"))
                .collect(Collectors.toList());

        // Check if the movie is currently playing
        List<Map<String, Object>> nowPlayingMovies = (List<Map<String, Object>>) nowPlayingResponse.get("results");
        boolean isNowPlaying = nowPlayingMovies.stream()
                .anyMatch(movie -> String.valueOf(movie.get("id")).equals(id));

        movieDetails.put("isNowPlaying", isNowPlaying);
        movieDetails.put("posterPath", posterPath != null ? "https://image.tmdb.org/t/p/w500" + posterPath : null);
        movieDetails.put("releaseDate", releaseDate);
        movieDetails.put("genres", genreNames);
        movieDetails.put("rating", movieDetails.get("vote_average") != null ? movieDetails.get("vote_average") : "N/A");


        // Fetch Cast
        List<Map<String, Object>> castList = (List<Map<String, Object>>) creditsResponse.get("cast");
        List<Map<String, Object>> limitedCast = castList.stream()
                .limit(10)
                .map(cast -> Map.of(
                        "id", cast.get("id"),
                        "name", cast.get("name"),
                        "character", cast.get("character"),
                        "profile_path", cast.get("profile_path")
                ))
                .collect(Collectors.toList());

        // Fetch Crew (Director & Others)
        List<Map<String, Object>> crewList = (List<Map<String, Object>>) creditsResponse.get("crew");
        List<Map<String, Object>> directors = crewList.stream()
                .filter(member -> "Director".equals(member.get("job")))
                .map(director -> Map.of(
                        "id", director.get("id"),
                        "name", director.get("name"),
                        "profile_path", director.get("profile_path"),
                        "job", director.get("job")
                ))
                .collect(Collectors.toList());

        // Fetch Trailer
        List<Map<String, Object>> videoResults = (List<Map<String, Object>>) videosResponse.get("results");
        Optional<String> trailerKey = videoResults.stream()
                .filter(video -> "Trailer".equals(video.get("type")) && "YouTube".equals(video.get("site")))
                .map(video -> (String) video.get("key"))
                .findFirst();

        movieDetails.put("cast", limitedCast);
        movieDetails.put("crew", directors);
        trailerKey.ifPresent(trailer -> movieDetails.put("trailer", trailer));

        return ResponseEntity.ok(movieDetails);
    }


    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchMovies(@RequestParam String name) {
        String searchUrl = "https://api.themoviedb.org/3/search/movie?api_key=" + tmdbApiKey + "&query=" + name + "&language=en-US";

        Map<String, Object> response = restTemplate.getForObject(searchUrl, Map.class);
        List<Map<String, Object>> movies = (List<Map<String, Object>>) response.get("results");

        return ResponseEntity.ok(movies);
    }




}
