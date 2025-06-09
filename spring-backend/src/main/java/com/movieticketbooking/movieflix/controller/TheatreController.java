package com.movieticketbooking.movieflix.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/theatres")
@CrossOrigin(origins = "https://movieflix-sooty.vercel.app")
public class TheatreController {

    @Value("${google.api.key}")
    private String googlePlacesApiKey;

    @PostMapping("/nearby")
    public ResponseEntity<List<TheatreDTO>> getNearbyTheatres(@RequestBody LocationRequest locationRequest) {
        double userLat = locationRequest.getLat();
        double userLon = locationRequest.getLon();

        String url = "https://places.googleapis.com/v1/places:searchNearby?key=" + googlePlacesApiKey;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-FieldMask", "places.displayName,places.id,places.formattedAddress,places.rating,places.location");

        String requestBody = "{ \"includedTypes\": [\"movie_theater\"], \"locationRestriction\": { \"circle\": { \"center\": { \"latitude\": " + userLat + ", \"longitude\": " + userLon + " }, \"radius\": 25000 } } }";

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        List<TheatreDTO> theatres = parseTheatreData(response.getBody(), userLat, userLon);
        return ResponseEntity.ok(theatres);
    }


    @GetMapping("/details")
    public ResponseEntity<TheatreDTO> getTheatreDetails(@RequestParam String theatreId) {
        String url = "https://places.googleapis.com/v1/places/" + theatreId + "?key=" + googlePlacesApiKey;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-FieldMask", "displayName,formattedAddress,rating,location,internationalPhoneNumber,currentOpeningHours");

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

        return ResponseEntity.ok(parseTheatreDetails(response.getBody()));
    }

    private TheatreDTO parseTheatreDetails(String response) {
        ObjectMapper objectMapper = new ObjectMapper();
        TheatreDTO theatre = new TheatreDTO();

        try {
            JsonNode jsonResponse = objectMapper.readTree(response);

            if (jsonResponse.has("displayName")) {
                theatre.setName(jsonResponse.get("displayName").get("text").asText());
            }

            if (jsonResponse.has("formattedAddress")) {
                theatre.setAddress(jsonResponse.get("formattedAddress").asText());
            }

            if (jsonResponse.has("rating")) {
                theatre.setRating(jsonResponse.get("rating").asDouble());
            }

            if (jsonResponse.has("location")) {
                JsonNode location = jsonResponse.get("location");
                theatre.setLatitude(location.get("latitude").asDouble());
                theatre.setLongitude(location.get("longitude").asDouble());
            }


        } catch (Exception e) {
            e.printStackTrace();
        }

        return theatre;
    }



    private List<TheatreDTO> parseTheatreData(String response, double userLat, double userLon) {
        List<TheatreDTO> theatres = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            JsonNode jsonResponse = objectMapper.readTree(response);
            JsonNode places = jsonResponse.get("places");

            if (places == null || places.isEmpty()) {
                return theatres;
            }

            for (JsonNode theatreJson : places) {
                if (!theatreJson.has("displayName") || !theatreJson.has("id")) continue;

                String name = theatreJson.get("displayName").get("text").asText();

                if (!name.toLowerCase().contains("cinema") && !name.toLowerCase().contains("theatre") &&
                        !name.toLowerCase().contains("theater")) {
                    continue;
                }

                TheatreDTO theatre = new TheatreDTO();
                theatre.setId(theatreJson.get("id").asText());
                theatre.setName(name);
                theatre.setAddress(theatreJson.has("formattedAddress") ? theatreJson.get("formattedAddress").asText() : "Address not available");
                theatre.setRating(theatreJson.has("rating") ? theatreJson.get("rating").asDouble() : 0.0);

                if (theatreJson.has("location")) {
                    JsonNode location = theatreJson.get("location");
                    double theatreLat = location.get("latitude").asDouble();
                    double theatreLon = location.get("longitude").asDouble();
                    theatre.setLatitude(theatreLat);
                    theatre.setLongitude(theatreLon);

                    // Calculate Distance
                    theatre.setDistance(calculateDistance(userLat, userLon, theatreLat, theatreLon));
                }

                theatres.add(theatre);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return theatres;
    }


    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }


    public static class TheatreDTO {
        private String id;
        private String name;
        private String address;
        private double rating;
        private double latitude;
        private double longitude;
        private double distance;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
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
        public double getDistance() { return distance; }
        public void setDistance(double distance) { this.distance = distance; }
    }

    public static class LocationRequest {
        private double lat;
        private double lon;

        public double getLat() { return lat; }
        public void setLat(double lat) { this.lat = lat; }
        public double getLon() { return lon; }
        public void setLon(double lon) { this.lon = lon; }
    }
}
