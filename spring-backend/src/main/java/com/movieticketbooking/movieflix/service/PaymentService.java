package com.movieticketbooking.movieflix.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import org.json.JSONObject;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.*;
import org.apache.commons.codec.digest.HmacUtils;

@Service
public class PaymentService {

    @Value("${razorpay.api.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.api.key.secret}")
    private String razorpayKeySecret;

    public ResponseEntity<?> createPaymentOrder(OrderRequest orderRequest, String userEmail) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Convert amount to paise (Indian currency subunits)
            int amountInPaise = (int) Math.round(orderRequest.getAmount() * 100);

            JSONObject orderRequestJson = new JSONObject();
            orderRequestJson.put("amount", amountInPaise);
            orderRequestJson.put("currency", "INR");
            orderRequestJson.put("receipt", "order_"+System.currentTimeMillis());
            orderRequestJson.put("payment_capture", true);

            // Build notes with all booking details
            JSONObject notesJson = new JSONObject();
            notesJson.put("userId", userEmail);
            notesJson.put("movieId", orderRequest.getMovieId());
            notesJson.put("theaterId", orderRequest.getTheaterId());
            notesJson.put("showtime", orderRequest.getShowtime());
            notesJson.put("category", orderRequest.getCategory());

            if (orderRequest.getSeats() != null && !orderRequest.getSeats().isEmpty()) {
                notesJson.put("seats", String.join(",", orderRequest.getSeats()));
            } else {
                notesJson.put("seats", "");
            }

            notesJson.put("date", orderRequest.getDate());

            // Add food items if present
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
            }

            orderRequestJson.put("notes", notesJson);

            // Create Razorpay order
            Order order = razorpay.orders.create(orderRequestJson);

            // Prepare response for frontend
            JSONObject response = new JSONObject();
            response.put("id", order.get("id").toString());
            response.put("amount", order.get("amount").toString());
            response.put("currency", order.get("currency").toString());
            response.put("key", razorpayKeyId);

            return ResponseEntity.ok(response.toString());

        } catch (RazorpayException e) {
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to create payment order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse.toString());
        }
    }

    public ResponseEntity<?> verifyAndCompletePayment(PaymentVerificationRequest verificationRequest) {
        try {
            // Generate expected signature
            String generatedSignature = HmacUtils.hmacSha256Hex(
                    razorpayKeySecret,
                    verificationRequest.getRazorpayOrderId() + "|" + verificationRequest.getRazorpayPaymentId()
            );

            // Verify signature matches
            if (generatedSignature.equals(verificationRequest.getRazorpaySignature())) {
                // Payment successful - create booking record
                // TODO: Add your booking creation logic here

                JSONObject successResponse = new JSONObject();
                successResponse.put("status", "success");
                successResponse.put("orderId", verificationRequest.getRazorpayOrderId());
                successResponse.put("paymentId", verificationRequest.getRazorpayPaymentId());
                successResponse.put("redirectUrl", "/booking-success?orderId=" + verificationRequest.getRazorpayOrderId());

                return ResponseEntity.ok(successResponse.toString());
            } else {
                // Signature verification failed
                JSONObject failedResponse = new JSONObject();
                failedResponse.put("status", "failed");
                failedResponse.put("message", "Payment verification failed");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(failedResponse.toString());
            }

        } catch (Exception e) {
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Error during payment verification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse.toString());
        }
    }

    // Inner classes to match your DTOs
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