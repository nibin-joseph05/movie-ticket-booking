package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.models.*;
import com.movieticketbooking.movieflix.repository.*;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookedSeatRepository bookedSeatRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private FoodOrderRepository foodOrderRepository;

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

    private double getSeatPrice(Showtime showtime, String seatNumber) {
        if (seatNumber.startsWith("S")) return showtime.getSilverPrice();
        if (seatNumber.startsWith("G")) return showtime.getGoldPrice();
        if (seatNumber.startsWith("P")) return showtime.getPlatinumPrice();
        return showtime.getSilverPrice(); // default
    }

    @Transactional
    public ResponseEntity<?> verifyAndCompletePayment(PaymentVerificationRequest verificationRequest) {
        try {
            // 1. Verify payment signature
            System.out.println("=== Starting payment verification ===");
            System.out.println("Request data: " + new JSONObject(verificationRequest).toString());
            System.out.println("Verifying signature...");
            String generatedSignature = HmacUtils.hmacSha256Hex(
                    razorpayKeySecret,
                    verificationRequest.getRazorpayOrderId() + "|" + verificationRequest.getRazorpayPaymentId()
            );

            if (!generatedSignature.equals(verificationRequest.getRazorpaySignature())) {
                System.err.println("Signature verification failed");
                throw new RuntimeException("Signature verification failed");
            }

            System.out.println("Getting user email...");
            String userEmail = verificationRequest.getUserEmail();
            if (userEmail == null) {
                System.out.println("Falling back to Razorpay notes for email");
                // Fallback to Razorpay notes if needed
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                Order order = razorpay.orders.fetch(verificationRequest.getRazorpayOrderId());
                JSONObject notes = order.get("notes");

                userEmail = notes.optString("userId", null);
                if (userEmail == null) {
                    System.err.println("User email not found in request or notes");
                    throw new RuntimeException("User email not found");
                }
            }

            // 2. Get data from verification request (preferred) or Razorpay notes
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            Order order = razorpay.orders.fetch(verificationRequest.getRazorpayOrderId());
            JSONObject notes = order.get("notes");


            // Get showtime - prefer request but fallback to notes
            System.out.println("Processing showtime...");
            String showtimeId = verificationRequest.getShowtime();
            if (showtimeId == null || showtimeId.isEmpty()) {
                showtimeId = notes.getString("showtime");
            }
            System.out.println("Showtime ID: " + showtimeId);

            // Get seats - prefer request but fallback to notes
            String seatsData = verificationRequest.getSeats();
            if (seatsData == null || seatsData.isEmpty()) {
                seatsData = notes.optString("seats", "");
            }

            // Get food items - prefer request but fallback to notes
            String foodItemsData = verificationRequest.getFoodItems();
            if (foodItemsData == null || foodItemsData.isEmpty()) {
                foodItemsData = notes.has("foodItems") ? notes.getJSONArray("foodItems").toString() : "[]";
            }

            // 3. Create and save the booking record
            System.out.println("Creating booking...");
            Booking booking = new Booking();
            booking.setBookingReference(verificationRequest.getRazorpayOrderId());
            booking.setPaymentStatus("CONFIRMED");
            booking.setTotalAmount(verificationRequest.getAmount());
            booking.setBookingTime(LocalDateTime.now());

            // Set user
            System.out.println("Setting user...");
            booking.setUser(userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found")));

            // Set showtime
            System.out.println("Setting showtime...");
            String showtimeTime = verificationRequest.getShowtime();
            Long movieId = Long.parseLong(verificationRequest.getMovieId());
            String theatreId = verificationRequest.getTheaterId();
            LocalDate showtimeDate = LocalDate.parse(verificationRequest.getDate());

            // Try to find existing showtime
            Optional<Showtime> existingShowtime = showtimeRepository.findByMovieIdAndTheatreIdAndDateAndTime(
                    movieId,
                    theatreId,
                    showtimeDate,
                    showtimeTime
            );

            Showtime showtime;
            if (existingShowtime.isEmpty()) {
                System.out.println("Creating new showtime as none exists...");
                showtime = new Showtime();

                // Just store the IDs directly
                showtime.setMovieId(movieId);
                showtime.setTheatreId(theatreId);

                showtime.setDate(showtimeDate);
                showtime.setTime(showtimeTime);

                // Set default values
                showtime.setSilverPrice(140.0);
                showtime.setGoldPrice(170.0);
                showtime.setPlatinumPrice(210.0);
                showtime.setSilverSeatsAvailable(40);
                showtime.setGoldSeatsAvailable(20);
                showtime.setPlatinumSeatsAvailable(10);

                showtime = showtimeRepository.save(showtime);
                System.out.println("New showtime created with ID: " + showtime.getId());
            } else {
                showtime = existingShowtime.get();
            }

            booking.setShowtime(showtime);
            System.out.println("Saving booking...");
            booking = bookingRepository.save(booking);

            // 4. Create and save the payment record
            Payment payment = new Payment();
            payment.setAmount(booking.getTotalAmount());
            payment.setCurrency("INR");
            payment.setMethod(Payment.PaymentMethod.RAZORPAY);
            payment.setStatus(Payment.PaymentStatus.SUCCESSFUL);
            payment.setTransactionId(verificationRequest.getRazorpayPaymentId());
            payment.setPaymentTime(LocalDateTime.now());
            payment.setBooking(booking);
            paymentRepository.save(payment);

            // 5. Save booked seats
            if (!seatsData.isEmpty()) {
                String[] seatNumbers = seatsData.split(",");
                for (String seatNumber : seatNumbers) {
                    BookedSeat seat = new BookedSeat();
                    seat.setSeatNumber(seatNumber.trim());
                    seat.setPrice(getSeatPrice(showtime, seatNumber.trim()));
                    seat.setBooking(booking);
                    bookedSeatRepository.save(seat);
                }
            }

            // 6. Save food orders
            if (!foodItemsData.equals("[]")) {
                JSONArray foodItems = new JSONArray(foodItemsData);
                for (int i = 0; i < foodItems.length(); i++) {
                    JSONObject item = foodItems.getJSONObject(i);
                    FoodOrder foodOrder = new FoodOrder();
                    foodOrder.setFoodItem(foodItemRepository.findById(Long.parseLong(item.getString("id")))
                            .orElseThrow(() -> new RuntimeException("Food item not found")));
                    foodOrder.setQuantity(item.getInt("quantity"));
                    foodOrder.setPriceAtOrder(item.getDouble("price"));
                    foodOrder.setBooking(booking);
                    foodOrderRepository.save(foodOrder);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "bookingId", booking.getId(),
                    "redirectUrl", "/booking-success?bookingId=" + verificationRequest.getRazorpayOrderId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment verification failed: " + e.getMessage()));
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
        private String seats;
        private String foodItems;
        private String showtime;
        private String date;
        private String category;
        private String movieId;
        private String theaterId;
        private double amount;
        private String userEmail;

        // Getters and setters
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

        public String getSeats() {
            return seats;
        }

        public void setSeats(String seats) {
            this.seats = seats;
        }

        public String getFoodItems() {
            return foodItems;
        }

        public void setFoodItems(String foodItems) {
            this.foodItems = foodItems;
        }

        public String getShowtime() {
            return showtime;
        }

        public void setShowtime(String showtime) {
            this.showtime = showtime;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getMovieId() {
            return movieId;
        }

        public void setMovieId(String movieId) {
            this.movieId = movieId;
        }

        public String getTheaterId() {
            return theaterId;
        }

        public void setTheaterId(String theaterId) {
            this.theaterId = theaterId;
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }
        public String getUserEmail() {
            return userEmail;
        }

        public void setUserEmail(String userEmail) {
            this.userEmail = userEmail;
        }
    }

}