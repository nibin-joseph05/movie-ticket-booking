package com.movieticketbooking.movieflix.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/theatres")
@CrossOrigin(origins = "http://localhost:3000")
public class TheatreController {

    @Value("${google.api.key}")
    private String googlePlacesApiKey;

    @PostMapping("/nearby")
    public ResponseEntity<List<TheatreDTO>> getNearbyTheatres(@RequestBody LocationRequest locationRequest) {
        double lat = locationRequest.getLat();
        double lon = locationRequest.getLon();

        String url = "https://places.googleapis.com/v1/places:searchNearby?key=" + googlePlacesApiKey;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-FieldMask", "places.displayName,places.id,places.location");

        String requestBody = "{ \"includedTypes\": [\"movie_theater\"], \"locationRestriction\": { \"circle\": { \"center\": { \"latitude\": " + lat + ", \"longitude\": " + lon + " }, \"radius\": 25000 } } }";

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        List<TheatreDTO> theatres = parseTheatreData(response.getBody());

        return ResponseEntity.ok(theatres);
    }


    private List<TheatreDTO> parseTheatreData(String response) {
        List<TheatreDTO> theatres = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            JsonNode jsonResponse = objectMapper.readTree(response);
            JsonNode places = jsonResponse.get("places"); // Corrected key

            if (places == null || places.isEmpty()) {
                return theatres;
            }

            for (JsonNode theatreJson : places) {
                TheatreDTO theatre = new TheatreDTO();
                theatre.setName(theatreJson.has("displayName") ? theatreJson.get("displayName").get("text").asText() : "Unknown Theatre");
                theatre.setAddress(theatreJson.has("formattedAddress") ? theatreJson.get("formattedAddress").asText() : "Unknown Address");
                theatre.setRating(theatreJson.has("rating") ? theatreJson.get("rating").asDouble() : 0.0);

                if (theatreJson.has("location")) {
                    JsonNode location = theatreJson.get("location");
                    theatre.setLatitude(location.get("latitude").asDouble());
                    theatre.setLongitude(location.get("longitude").asDouble());
                }

                theatres.add(theatre);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return theatres;
    }


    // DTO (Data Transfer Object) to send simplified theatre data
    public static class TheatreDTO {
        private String name;
        private String address;
        private double rating;
        private double latitude;
        private double longitude;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public double getRating() { return rating; }
        public void setRating(double rating) { this.rating = rating; }
        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }
        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
    }

    // Request body class to receive latitude and longitude
    public static class LocationRequest {
        private double lat;
        private double lon;

        public double getLat() { return lat; }
        public void setLat(double lat) { this.lat = lat; }
        public double getLon() { return lon; }
        public void setLon(double lon) { this.lon = lon; }
    }
}
