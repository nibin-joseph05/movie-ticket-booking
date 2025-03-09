package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.models.Theatre;
import com.movieticketbooking.movieflix.repository.TheatreRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class TheatreService {

    @Value("${google.api.key}")
    private String googleApiKey;

    private final TheatreRepository theatreRepository;
    private final RestTemplate restTemplate;

    public TheatreService(TheatreRepository theatreRepository, RestTemplate restTemplate) {
        this.theatreRepository = theatreRepository;
        this.restTemplate = restTemplate;
    }

    // Fetch nearby theatres
    public List<Theatre> getNearbyTheatres(double lat, double lon) {
        String url = String.format(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%f,%f&radius=5000&type=movie_theater&key=%s",
                lat, lon, googleApiKey
        );

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<Theatre> theatres = new ArrayList<>();

        if (response != null && response.containsKey("results")) {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

            for (Map<String, Object> result : results) {
                String placeId = (String) result.get("place_id");
                String name = (String) result.get("name");
                String address = (String) result.get("vicinity");
                Double rating = result.get("rating") != null ? ((Number) result.get("rating")).doubleValue() : 0.0;

                Theatre theatre = new Theatre(placeId, name, address, rating);
                theatres.add(theatre);
            }
        }
        return theatres;
    }

    // Save selected theatre
    public Theatre saveTheatre(Theatre theatre) {
        if (!theatreRepository.existsByPlaceId(theatre.getPlaceId())) {
            return theatreRepository.save(theatre);
        }
        return null; // Already exists
    }
}
