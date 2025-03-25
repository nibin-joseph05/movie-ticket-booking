package com.movieticketbooking.movieflix.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    @Value("${spoonacular.api.key}")
    private String spoonacularApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Constants for food items
    private static final String DEFAULT_FOOD_QUERY = "popcorn+nachos+pepsi+burger+combo";
    private static final int DEFAULT_FOOD_ITEMS_COUNT = 10;
    private static final String DEFAULT_ALLERGENS_WARNING = "May contain allergens";
    private static final String DEFAULT_CALORIES = "N/A";

    @GetMapping("/details")
    public ResponseEntity<Map<String, Object>> getBookingDetails(
            @RequestParam String movieId,
            @RequestParam String theaterId) {

        // Fetch movie details from TMDB
        Map<String, Object> movieDetails = fetchMovieDetails(movieId);
        // Fetch theater details from Google Places API
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

        // Movie details
        response.put("movie", Map.of(
                "name", movieDetails.get("title"),
                "posterPath", buildPosterPath(movieDetails.get("poster_path")),
                "releaseDate", movieDetails.get("release_date"),
                "genres", extractGenres(movieDetails),
                "rating", movieDetails.getOrDefault("vote_average", "N/A"),
                "synopsis", movieDetails.get("overview")
        ));

        // Theater details
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

    @GetMapping("/food")
    public ResponseEntity<List<Map<String, Object>>> getFoodOptions(
            @RequestParam(required = false) String query) {

        try {
            List<Map<String, Object>> foodItems = fetchFoodItemsFromApi(query);
            return ResponseEntity.ok(foodItems.isEmpty() ?
                    getFallbackFoodItems() : foodItems);

        } catch (Exception e) {
            System.err.println("Error fetching food options: " + e.getMessage());
            return ResponseEntity.ok(getFallbackFoodItems());
        }
    }

    private List<Map<String, Object>> fetchFoodItemsFromApi(String query) throws Exception {
        String url = buildFoodApiUrl(query);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !response.containsKey("menuItems")) {
            return Collections.emptyList();
        }

        return ((List<Map<String, Object>>) response.get("menuItems")).stream()
                .map(this::createFoodItem)
                .collect(Collectors.toList());
    }

    private String buildFoodApiUrl(String query) {
        String baseUrl = String.format(
                "https://api.spoonacular.com/food/menuItems/search?apiKey=%s&number=%d",
                spoonacularApiKey,
                DEFAULT_FOOD_ITEMS_COUNT
        );

        return query == null || query.isEmpty() ?
                baseUrl + "&query=" + DEFAULT_FOOD_QUERY :
                baseUrl + "&query=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
    }

    private Map<String, Object> createFoodItem(Map<String, Object> apiItem) {
        return Map.of(
                "name", apiItem.getOrDefault("title", "Unknown Item"),
                "description", buildFoodDescription(apiItem),
                "price", apiItem.getOrDefault("price", 200),
                "calories", extractCalories(apiItem),
                "allergens", DEFAULT_ALLERGENS_WARNING,
                "image", processImageUrl(apiItem.get("image"), apiItem.get("title"))
        );
    }

    private String processImageUrl(Object imageObj, Object title) {
        // If API provides image URL
        if (imageObj != null && !imageObj.toString().isEmpty()) {
            String imageUrl = imageObj.toString();
            // Ensure URL is complete (some APIs return relative paths)
            if (!imageUrl.startsWith("http")) {
                return "https://spoonacular.com/cdn/ingredients_100x100/" + imageUrl;
            }
            return imageUrl;
        }

        // Fallback to local images based on item name
        return getDefaultImageForItem(title);
    }

    private String buildFoodDescription(Map<String, Object> apiItem) {
        return apiItem.containsKey("restaurantChain") ?
                "From " + apiItem.get("restaurantChain") : "Cinema snack";
    }

    private String extractCalories(Map<String, Object> apiItem) {
        if (apiItem.get("nutrition") == null) {
            return DEFAULT_CALORIES;
        }

        Map<String, Object> nutrition = (Map<String, Object>) apiItem.get("nutrition");
        return nutrition.get("calories") != null ?
                nutrition.get("calories").toString() : DEFAULT_CALORIES;
    }

    private String getDefaultImageForItem(Object title) {
        if (title == null) return "";

        String name = title.toString().toLowerCase();
        if (name.contains("popcorn")) return "/images/popcorn.jpg";
        if (name.contains("pepsi")) return "/images/pepsi.jpg";
        if (name.contains("nachos")) return "/images/nachos.jpg";
        if (name.contains("burger")) return "/images/burger.jpg";
        if (name.contains("combo")) return "/images/combo1.jpg";

        return "";
    }

    private List<Map<String, Object>> getFallbackFoodItems() {
        return List.of(
                createFallbackFoodItem(
                        "Regular Popcorn",
                        "Salted popcorn (425 Kcal)",
                        300,
                        425,
                        "Milk",
                        "/images/popcorn.jpg"
                ),
                createFallbackFoodItem(
                        "Medium Pepsi",
                        "Cold refreshing drink (290 Kcal)",
                        290,
                        290,
                        "Caffeine",
                        "/images/pepsi.jpg"
                ),
                createFallbackFoodItem(
                        "Nachos with Cheese",
                        "Crispy nachos with cheese sauce (665 Kcal)",
                        300,
                        665,
                        "Milk, Gluten",
                        "/images/nachos.jpg"
                )
        );
    }

    private Map<String, Object> createFallbackFoodItem(
            String name, String description,
            int price, int calories,
            String allergens, String image) {

        return Map.of(
                "name", name,
                "description", description,
                "price", price,
                "calories", calories,
                "allergens", allergens,
                "image", image
        );
    }
}