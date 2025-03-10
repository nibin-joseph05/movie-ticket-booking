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
        circle.put("radius", 10000); // Expand radius to 10 km
        locationRestriction.put("circle", circle);

        requestBody.put("locationRestriction", locationRestriction);

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", apiKey);
        headers.set("X-Goog-FieldMask", "places.displayName,places.id,places.location,places.rating,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.currentOpeningHours,places.types");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse JSON response
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode places = root.path("places");

                for (JsonNode place : places) {
                    // Ensure it is categorized as a movie theater
                    if (place.has("types") && place.path("types").toString().contains("movie_theater")) {
                        String id = place.path("id").asText();
                        String name = place.path("displayName").path("text").asText();
                        double theatreLat = place.path("location").path("latitude").asDouble();
                        double theatreLon = place.path("location").path("longitude").asDouble();
                        Double rating = place.has("rating") ? place.path("rating").asDouble() : null;
                        String address = place.has("formattedAddress") ? place.path("formattedAddress").asText() : "Address not available";
                        String phoneNumber = place.has("internationalPhoneNumber") ? place.path("internationalPhoneNumber").asText() : "Not Available";

                        double distance = calculateDistance(lat, lon, theatreLat, theatreLon);

                        String openingHours = "Not Available";
                        if (place.has("currentOpeningHours")) {
                            JsonNode openingHoursNode = place.path("currentOpeningHours").path("weekdayDescriptions");
                            if (openingHoursNode.isArray()) {
                                List<String> hoursList = new ArrayList<>();
                                for (JsonNode day : openingHoursNode) {
                                    hoursList.add(day.asText());
                                }
                                openingHours = String.join(", ", hoursList);
                            }
                        }

                        Theatre theatre = new Theatre(id, name, theatreLat, theatreLon, rating, address, phoneNumber, openingHours, distance);
                        theatres.add(theatre);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return theatres;
    }



    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    public Theatre saveTheatre(Theatre theatre) {
        return theatre;
    }
}
