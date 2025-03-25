package com.movieticketbooking.movieflix.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/food")
public class FoodController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String FOOD_API_BASE_URL = "https://free-food-menus-api-two.vercel.app";

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getFoodCategories() {
        List<String> categories = Arrays.asList(
                "burgers", "pizzas", "sandwiches", "ice-cream",
                "drinks", "bbqs", "best-foods", "breads"
        );
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/items")
    public ResponseEntity<List<Map<String, Object>>> getFoodItems(
            @RequestParam(required = false) String category) {

        try {
            String apiUrl;
            if (category == null || category.isEmpty()) {
                apiUrl = FOOD_API_BASE_URL + "/best-foods";
            } else {
                apiUrl = FOOD_API_BASE_URL + "/" + category.toLowerCase();
            }

            Object[] foodItems = restTemplate.getForObject(apiUrl, Object[].class);

            List<Map<String, Object>> formattedItems = new ArrayList<>();
            if (foodItems != null) {
                for (Object item : foodItems) {
                    Map<String, Object> foodItem = (Map<String, Object>) item;
                    formattedItems.add(formatFoodItem(foodItem));
                }
            }

            return ResponseEntity.ok(formattedItems.isEmpty() ? getFallbackItems() : formattedItems);

        } catch (Exception e) {
            System.err.println("Error fetching food items: " + e.getMessage());
            return ResponseEntity.ok(getFallbackItems());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchFoodItems(
            @RequestParam String query) {

        try {
            // Get all categories first
            List<String> categories = Arrays.asList(
                    "burgers", "pizzas", "sandwiches", "ice-cream",
                    "drinks", "bbqs", "best-foods", "breads"
            );

            List<Map<String, Object>> results = new ArrayList<>();

            // Search across all categories
            for (String category : categories) {
                String apiUrl = FOOD_API_BASE_URL + "/" + category;
                Object[] items = restTemplate.getForObject(apiUrl, Object[].class);

                if (items != null) {
                    for (Object item : items) {
                        Map<String, Object> foodItem = (Map<String, Object>) item;
                        String name = foodItem.get("name").toString().toLowerCase();
                        if (name.contains(query.toLowerCase())) {
                            results.add(formatFoodItem(foodItem));
                        }
                    }
                }
            }

            // If no results found, return fallback items that match the query
            if (results.isEmpty()) {
                List<Map<String, Object>> fallbackItems = getFallbackItems();
                return ResponseEntity.ok(
                        fallbackItems.stream()
                                .filter(item -> item.get("name").toString().toLowerCase()
                                        .contains(query.toLowerCase()))
                                .collect(Collectors.toList())
                );
            }

            return ResponseEntity.ok(results);

        } catch (Exception e) {
            System.err.println("Error searching food items: " + e.getMessage());
            // Return filtered fallback items
            List<Map<String, Object>> fallbackItems = getFallbackItems();
            return ResponseEntity.ok(
                    fallbackItems.stream()
                            .filter(item -> item.get("name").toString().toLowerCase()
                                    .contains(query.toLowerCase()))
                            .collect(Collectors.toList())
            );
        }
    }

    private Map<String, Object> formatFoodItem(Map<String, Object> item) {
        return Map.of(
                "id", item.get("id"),
                "name", item.get("name"),
                "description", item.get("dsc"),
                "price", getRandomPrice(),
                "calories", getRandomCalories(),
                "allergens", "May contain allergens",
                "image", item.get("img"),
                "category", getCategoryFromItem(item)
        );
    }

    private double getRandomPrice() {
        // Generate random price between 100 and 500
        return 100 + Math.random() * 400;
    }

    private int getRandomCalories() {
        // Generate random calories between 200 and 800
        return 200 + (int)(Math.random() * 600);
    }

    private String getCategoryFromItem(Map<String, Object> item) {
        // Extract category from API response if available
        if (item.containsKey("category")) {
            return item.get("category").toString();
        }
        return "snack";
    }

    private List<Map<String, Object>> getFallbackItems() {
        return Arrays.asList(
                createFallbackItem("Popcorn Combo", "Large popcorn with drink", 350, 450),
                createFallbackItem("Nachos", "Cheesy nachos with salsa", 300, 550),
                createFallbackItem("Soft Drink", "Large carbonated beverage", 150, 250)
        );
    }

    private Map<String, Object> createFallbackItem(String name, String desc, double price, int calories) {
        return Map.of(
                "id", UUID.randomUUID().toString(),
                "name", name,
                "description", desc,
                "price", price,
                "calories", calories,
                "allergens", "May contain allergens",
                "image", "/images/" + name.toLowerCase().replace(" ", "-") + ".jpg",
                "category", "snack"
        );
    }
}