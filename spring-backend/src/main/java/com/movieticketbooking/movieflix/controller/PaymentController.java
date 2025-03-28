package com.movieticketbooking.movieflix.controller;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import org.json.JSONObject;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.apache.commons.codec.digest.HmacUtils;
import jakarta.servlet.http.HttpSession;
import com.movieticketbooking.movieflix.models.User;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.api.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.api.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            int amountInPaise = (int) Math.round(orderRequest.getAmount() * 100);

            JSONObject orderRequestJson = new JSONObject();
            orderRequestJson.put("amount", amountInPaise);
            orderRequestJson.put("currency", "INR");
            orderRequestJson.put("receipt", "order_" + System.currentTimeMillis());
            orderRequestJson.put("payment_capture", 1);

            JSONObject notesJson = new JSONObject();
            notesJson.put("userId", user.getEmail());
            notesJson.put("movieId", orderRequest.getMovieId());
            notesJson.put("theaterId", orderRequest.getTheaterId());
            notesJson.put("showtime", orderRequest.getShowtime());
            notesJson.put("category", orderRequest.getCategory());

            List<String> seats = orderRequest.getSeats();
            notesJson.put("seats", seats != null && !seats.isEmpty() ? String.join(",", seats) : "");

            notesJson.put("date", orderRequest.getDate());

            if (orderRequest.getFoodItems() != null && !orderRequest.getFoodItems().isEmpty()) {
                JSONArray foodItemsArray = new JSONArray();
                for (FoodItemDTO item : orderRequest.getFoodItems()) {
                    JSONObject foodItemJson = new JSONObject();
                    foodItemJson.put("id", item.getId());
                    foodItemJson.put("name", item.getName());
                    foodItemJson.put("description", item.getDescription());
                    foodItemJson.put("category", item.getCategory());
                    foodItemJson.put("image", item.getImage());
                    foodItemJson.put("allergens", item.getAllergens());
                    foodItemJson.put("price", item.getPrice());
                    foodItemJson.put("calories", item.getCalories());
                    foodItemJson.put("quantity", item.getQuantity());
                    foodItemsArray.put(foodItemJson);
                }

                notesJson.put("foodItems", foodItemsArray);
                notesJson.put("totalFoodAmount", orderRequest.getFoodItems().stream()
                        .mapToDouble(item -> item.getPrice() * item.getQuantity())
                        .sum());
            }

            orderRequestJson.put("notes", notesJson);

            Order order = razorpay.orders.create(orderRequestJson);

            JSONObject response = new JSONObject();
            response.put("id", order.get("id").toString()); // Explicit toString()
            response.put("amount", Integer.parseInt(order.get("amount").toString())); // Convert to int
            response.put("currency", order.get("currency").toString()); // Explicit toString()
            response.put("key", razorpayKeyId);

            return ResponseEntity.ok(response.toString());

        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest verificationRequest) {
        try {
            String generatedSignature = HmacUtils.hmacSha256Hex(
                    razorpayKeySecret,
                    verificationRequest.getRazorpayOrderId() + "|" + verificationRequest.getRazorpayPaymentId()
            );

            if (generatedSignature.equals(verificationRequest.getRazorpaySignature())) {
                return ResponseEntity.ok(new JSONObject()
                        .put("status", "success")
                        .put("orderId", verificationRequest.getRazorpayOrderId())
                        .put("paymentId", verificationRequest.getRazorpayPaymentId()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new JSONObject()
                                .put("status", "failed")
                                .put("message", "Payment verification failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new JSONObject()
                            .put("status", "error")
                            .put("message", "Error verifying payment: " + e.getMessage()));
        }
    }

    // Updated DTO classes to match the incoming request format
    public static class OrderRequest {
        private double amount;
        private String movieId;
        private String theaterId;
        private String showtime;
        private String category;
        private List<String> seats;
        private String date;
        private List<FoodItemDTO> foodItems;

        // Getters and setters
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getMovieId() { return movieId; }
        public void setMovieId(String movieId) { this.movieId = movieId; }
        public String getTheaterId() { return theaterId; }
        public void setTheaterId(String theaterId) { this.theaterId = theaterId; }
        public String getShowtime() { return showtime; }
        public void setShowtime(String showtime) { this.showtime = showtime; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public List<String> getSeats() { return seats; }
        public void setSeats(List<String> seats) { this.seats = seats; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public List<FoodItemDTO> getFoodItems() { return foodItems; }
        public void setFoodItems(List<FoodItemDTO> foodItems) { this.foodItems = foodItems; }
    }

    public static class FoodItemDTO {
        private String id;
        private String name;
        private String description;
        private String category;
        private String image;
        private String allergens;
        private double price;
        private int calories;
        private int quantity;

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }
        public String getAllergens() { return allergens; }
        public void setAllergens(String allergens) { this.allergens = allergens; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class PaymentVerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;

        // Getters and setters
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }
}