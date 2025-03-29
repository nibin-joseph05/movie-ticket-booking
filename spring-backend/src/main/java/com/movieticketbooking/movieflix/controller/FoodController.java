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
            List<String> categories = Arrays.asList(
                    "burgers", "pizzas", "sandwiches", "ice-cream",
                    "drinks", "bbqs", "best-foods", "breads"
            );

            List<Map<String, Object>> results = new ArrayList<>();

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
        String id = item.get("id").toString();
        String name = item.get("name").toString();

        return Map.of(
                "id", id,
                "name", name,
                "description", item.get("dsc"),
                "price", (int) getStablePrice(id, name),
                "calories", getLogicalCalories(name),
                "allergens", "May contain allergens",
                "image", item.get("img"),
                "category", getCategoryFromItem(item)
        );
    }

    private double getStablePrice(String itemId, String itemName) {
        // Use absolute value to ensure positive hash
        int hash = Math.abs(itemId.hashCode() + itemName.hashCode());

        String lowerName = itemName.toLowerCase();
        if (lowerName.contains("burger")) return 199;
        if (lowerName.contains("pizza")) return 299;
        if (lowerName.contains("drink")) return 99;
        if (lowerName.contains("ice cream")) return 149;
        if (lowerName.contains("popcorn")) return 129;
        if (lowerName.contains("fries")) return 89;
        if (lowerName.contains("nachos")) return 179;

        // Ensure minimum price of 50 and maximum of 500
        return Math.max(50, 150 + (hash % 350));
    }

    private int getLogicalCalories(String itemName) {
        String lowerName = itemName.toLowerCase();

        if (lowerName.contains("burger")) return 550;
        if (lowerName.contains("pizza")) return 850;
        if (lowerName.contains("salad")) return 250;
        if (lowerName.contains("drink")) return 150;
        if (lowerName.contains("ice cream")) return 350;
        if (lowerName.contains("popcorn")) return 400;
        if (lowerName.contains("fries")) return 300;
        if (lowerName.contains("nachos")) return 500;

        return 450;
    }

    private String getCategoryFromItem(Map<String, Object> item) {
        if (item.containsKey("category")) {
            return item.get("category").toString();
        }
        return "snack";
    }

    private List<Map<String, Object>> getFallbackItems() {
        return Arrays.asList(
                createFallbackItem("Popcorn Combo", "Large popcorn with drink", 129, 400),
                createFallbackItem("Nachos", "Cheesy nachos with salsa", 179, 500),
                createFallbackItem("Soft Drink", "Large carbonated beverage", 99, 150)
        );
    }

    private Map<String, Object> createFallbackItem(String name, String desc, double price, int calories) {
        return Map.of(
                "id", UUID.randomUUID().toString(),
                "name", name,
                "description", desc,
                "price", (int) price,
                "calories", calories,
                "allergens", "May contain allergens",
                "image", "/images/" + name.toLowerCase().replace(" ", "-") + ".jpg",
                "category", "snack"
        );
    }
}