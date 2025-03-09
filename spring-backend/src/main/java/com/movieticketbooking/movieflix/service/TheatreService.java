package com.movieticketbooking.movieflix.service;

import org.springframework.beans.factory.annotation.Value;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticketbooking.movieflix.models.Theatre;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class TheatreService {

    @Value("${google.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public TheatreService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public List<Theatre> getNearbyTheatres(double lat, double lon) {
        List<Theatre> theatres = new ArrayList<>();

        String url = "https://places.googleapis.com/v1/places:searchNearby?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("includedTypes", List.of("movie_theater"));

        Map<String, Object> locationRestriction = new HashMap<>();
        Map<String, Object> circle = new HashMap<>();
        Map<String, Object> center = new HashMap<>();

        center.put("latitude", lat);
        center.put("longitude", lon);
        circle.put("center", center);
        circle.put("radius", 5000); // 5 km radius
        locationRestriction.put("circle", circle);

        requestBody.put("locationRestriction", locationRestriction);

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", apiKey); // ✅ Add API Key in header
        headers.set("X-Goog-FieldMask", "places.displayName,places.id,places.location,places.rating,places.formattedAddress");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse JSON response
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode places = root.path("places");

                for (JsonNode place : places) {
                    String id = place.path("id").asText();
                    String name = place.path("displayName").path("text").asText();
                    double theatreLat = place.path("location").path("latitude").asDouble();
                    double theatreLon = place.path("location").path("longitude").asDouble();
                    Double rating = place.has("rating") ? place.path("rating").asDouble() : null;

                    String address = place.has("formattedAddress") ? place.path("formattedAddress").asText() : "Address not available";

                    Theatre theatre = new Theatre(id, name, theatreLat, theatreLon, rating, address);
                    theatres.add(theatre);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return theatres;
    }

    public Theatre saveTheatre(Theatre theatre) {
        return theatre;
    }
}
