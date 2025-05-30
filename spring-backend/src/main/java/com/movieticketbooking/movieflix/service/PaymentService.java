package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.models.*;
import com.movieticketbooking.movieflix.repository.*;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.json.JSONException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.commons.codec.digest.HmacUtils;

@Service
public class PaymentService {

    @Value("${razorpay.api.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.api.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private EmailService emailService;

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${google.api.key}")
    private String googleApiKey;

    @Autowired
    private RestTemplate restTemplate;

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
            System.out.println("===== STARTING RAZORPAY ORDER CREATION =====");
            System.out.println("[DEBUG] Using Razorpay Key ID: " + razorpayKeyId.substring(0, 4) + "***"); // Mask partial key
            System.out.println("[DEBUG] User Email: " + userEmail);
            System.out.println("[DEBUG] Received Order Request: " + new JSONObject(orderRequest).toString());

            // Initialize Razorpay client
            System.out.println("[DEBUG] Initializing Razorpay client...");
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            System.out.println("[DEBUG] Razorpay client initialized successfully");

            // Amount conversion debug
            System.out.println("[DEBUG] Original Amount: " + orderRequest.getAmount());
            int amountInPaise = (int) Math.round(orderRequest.getAmount() * 100);
            System.out.println("[DEBUG] Converted Amount (paise): " + amountInPaise);

            // Build order request
            JSONObject orderRequestJson = new JSONObject();
            orderRequestJson.put("amount", amountInPaise);
            orderRequestJson.put("currency", "INR");
            orderRequestJson.put("receipt", "order_"+System.currentTimeMillis());
            orderRequestJson.put("payment_capture", true);

            // Build notes
            JSONObject notesJson = new JSONObject();
            notesJson.put("userId", userEmail);
            notesJson.put("movieId", orderRequest.getMovieId());
            notesJson.put("theaterId", orderRequest.getTheaterId());
            notesJson.put("showtime", orderRequest.getShowtime());
            notesJson.put("category", orderRequest.getCategory());

            // Seats handling
            if (orderRequest.getSeats() != null && !orderRequest.getSeats().isEmpty()) {
                String seats = String.join(",", orderRequest.getSeats());
                notesJson.put("seats", seats);
                System.out.println("[DEBUG] Processing " + orderRequest.getSeats().size() + " seats");
            } else {
                notesJson.put("seats", "");
                System.out.println("[DEBUG] No seats in request");
            }

            notesJson.put("date", orderRequest.getDate());

            // Food items debug
            if (orderRequest.getFoodItems() != null && !orderRequest.getFoodItems().isEmpty()) {
                System.out.println("[DEBUG] Processing " + orderRequest.getFoodItems().size() + " food items");
                JSONArray foodItemsArray = new JSONArray();
                for (FoodItemDTO item : orderRequest.getFoodItems()) {
                    JSONObject foodItemJson = new JSONObject();
                    foodItemJson.put("id", item.getId());
                    foodItemJson.put("name", item.getName());
                    foodItemJson.put("price", item.getPrice());
                    foodItemJson.put("quantity", item.getQuantity());
                    foodItemsArray.put(foodItemJson);
                }
                notesJson.put("foodItems", foodItemsArray);
            } else {
                System.out.println("[DEBUG] No food items in request");
            }

            // Validate notes size
            System.out.println("[DEBUG] Notes JSON size: " + notesJson.toString().length() + " characters");
            if (notesJson.toString().length() > 1500) {
                System.err.println("[ERROR] Notes payload exceeds 1500 character limit!");
            }

            orderRequestJson.put("notes", notesJson);
            System.out.println("[DEBUG] Final Order Request JSON: " + orderRequestJson.toString(4));

            // Create order
            System.out.println("[DEBUG] Creating Razorpay order...");
            Order order = razorpay.orders.create(orderRequestJson);
            System.out.println("[DEBUG] Razorpay Order Response: " + order.toString());

            // Prepare response
            JSONObject response = new JSONObject();
            response.put("id", order.get("id").toString());
            response.put("amount", order.get("amount").toString());
            response.put("currency", order.get("currency").toString());
            response.put("key", razorpayKeyId);

            System.out.println("===== ORDER CREATION SUCCESSFUL =====");
            return ResponseEntity.ok(response.toString());

        } catch (RazorpayException e) {
            String razorpayMessage = e.getMessage();
            String errorCode = "unknown";
            int statusCode = 500; // Default to internal server error
            String errorDesc = razorpayMessage;

            try {
                // Attempt to parse the error message as JSON
                JSONObject errorResponse = new JSONObject(razorpayMessage);
                JSONObject errorDetails = errorResponse.getJSONObject("error");
                errorCode = errorDetails.optString("code", "unknown");
                statusCode = errorDetails.optInt("http_status_code", 500);
                errorDesc = errorDetails.optString("description", razorpayMessage);
            } catch (JSONException jsonEx) {
                System.err.println("[ERROR] Failed to parse Razorpay error message: " + jsonEx.getMessage());
            }

            System.err.println("[RAZORPAY ERROR] Error Code: " + errorCode);
            System.err.println("[RAZORPAY ERROR] Status Code: " + statusCode);
            System.err.println("[RAZORPAY ERROR] Description: " + errorDesc);

            // Build error response
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to create payment order: " + errorDesc);
            errorResponse.put("razorpay_code", errorCode);
            errorResponse.put("http_status", statusCode);

            // Use the parsed status code, default to 500 if invalid
            HttpStatus httpStatus = HttpStatus.resolve(statusCode);
            if (httpStatus == null) {
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            }

            return ResponseEntity.status(httpStatus).body(errorResponse.toString());
        } catch (Exception e) {
            System.err.println("[UNEXPECTED ERROR] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"status\":\"error\",\"message\":\"Unexpected error occurred\"}");
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

            // 2. Create and save payment
            Payment payment = new Payment();
            payment.setAmount(booking.getTotalAmount());
            payment.setCurrency("INR");
            payment.setMethod(Payment.PaymentMethod.RAZORPAY);
            payment.setStatus(Payment.PaymentStatus.SUCCESSFUL);
            payment.setTransactionId(verificationRequest.getRazorpayPaymentId());
            payment.setPaymentTime(LocalDateTime.now());
            System.out.println("came this much...");
            payment.setBooking(booking);
            System.out.println("Saving payment...");
            payment = paymentRepository.save(payment);

            // 3. Update booking with payment reference
            booking.setPayment(payment);
            booking.setPaymentId(payment.getId().toString());
            System.out.println("Saving booking with payment id...");
            booking = bookingRepository.save(booking);

            // 5. Save booked seats
            if (!seatsData.isEmpty()) {
                String[] seatNumbers = seatsData.split(",");
                String category = verificationRequest.getCategory(); // Get category from request

                for (String seatNumber : seatNumbers) {
                    BookedSeat seat = new BookedSeat();
                    seat.setSeatNumber(seatNumber.trim());
                    seat.setPrice(getSeatPrice(showtime, seatNumber.trim()));
                    seat.setBooking(booking);

                    // Set the category based on request or seat number
                    if (category != null && !category.isEmpty()) {
                        seat.setCategory(BookedSeat.SeatCategory.valueOf(category.toUpperCase()));
                    } else {
                        // Fallback to determining category from seat number
                        if (seatNumber.trim().startsWith("S")) {
                            seat.setCategory(BookedSeat.SeatCategory.SILVER);
                        } else if (seatNumber.trim().startsWith("G")) {
                            seat.setCategory(BookedSeat.SeatCategory.GOLD);
                        } else if (seatNumber.trim().startsWith("P")) {
                            seat.setCategory(BookedSeat.SeatCategory.PLATINUM);
                        } else {
                            seat.setCategory(BookedSeat.SeatCategory.SILVER); // default
                        }
                    }

                    System.out.println("Saving Seats...");
                    bookedSeatRepository.save(seat);
                }
            }

            // 6. Save food orders
            if (!foodItemsData.equals("[]")) {
                JSONArray foodItems = new JSONArray(foodItemsData);
                for (int i = 0; i < foodItems.length(); i++) {
                    JSONObject item = foodItems.getJSONObject(i);

                    // First try to find food item by name (since ID might not exist in DB)
                    String foodName = item.getString("name");
                    Optional<FoodItem> existingFoodItem = foodItemRepository.findByName(foodName);
                    FoodItem foodItem;

                    if (existingFoodItem.isPresent()) {
                        foodItem = existingFoodItem.get();
                    } else {
                        // Create new food item if it doesn't exist
                        foodItem = new FoodItem();
                        foodItem.setName(foodName);
                        foodItem.setDescription(item.getString("description"));
                        foodItem.setPrice(item.getDouble("price"));
                        foodItem.setImageUrl(item.getString("image"));
                        foodItem.setIsAvailable(true);

                        // Handle category - convert from string to enum
                        try {
                            foodItem.setCategory(FoodItem.FoodCategory.valueOf(
                                    item.getString("category").toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            foodItem.setCategory(FoodItem.FoodCategory.SNACK); // default
                        }

                        foodItem = foodItemRepository.save(foodItem);
                        System.out.println("Created new food item: " + foodItem.getName());
                    }

                    // Create food order
                    FoodOrder foodOrder = new FoodOrder();
                    foodOrder.setFoodItem(foodItem);
                    foodOrder.setQuantity(item.getInt("quantity"));
                    foodOrder.setPriceAtOrder(item.getDouble("price"));
                    foodOrder.setBooking(booking);

                    System.out.println("Saving food order for: " + foodItem.getName());
                    foodOrderRepository.save(foodOrder);
                }
            }

            try {
                List<BookedSeat> bookedSeats = bookedSeatRepository.findByBookingId(booking.getId());
                List<FoodOrder> foodOrders = foodOrderRepository.findByBookingId(booking.getId());

                Map<String, Object> movieDetails = fetchMovieDetails(showtime.getMovieId().toString());
                Map<String, Object> theaterDetails = fetchTheaterDetails(showtime.getTheatreId());

                byte[] ticketPdf = ticketService.generateTicketPdf(
                        booking, showtime, bookedSeats, foodOrders, movieDetails, theaterDetails);

                // Properly construct the email content with theater details
                String theaterName = theaterDetails != null ? extractTheaterName(theaterDetails) : "Unknown Theater";

                String emailContent = "<p>Thank you for your booking! Your ticket details:</p>"
                        + "<p><strong>Movie:</strong> " + movieDetails.get("title") + "</p>"
                        + "<p><strong>Theater:</strong> " + theaterName + "</p>"
                        + "<p><strong>Date:</strong> " + showtime.getDate() + "</p>"
                        + "<p><strong>Time:</strong> " + showtime.getTime() + "</p>"
                        + "<p><strong>Seats:</strong> " + bookedSeats.stream()
                        .map(BookedSeat::getSeatNumber)
                        .collect(Collectors.joining(", ")) + "</p>";

                emailService.sendTicketEmail(
                        userEmail,
                        "Your MovieFlix Ticket #" + booking.getBookingReference(),
                        emailContent,
                        ticketPdf
                );
            } catch (Exception e) {
                // Log error but don't fail the payment
                System.err.println("Failed to generate/send ticket: " + e.getMessage());
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

    private Map<String, Object> fetchMovieDetails(String movieId) {
        String movieUrl = String.format(
                "https://api.themoviedb.org/3/movie/%s?api_key=%s&language=en-US",
                movieId, tmdbApiKey);
        return restTemplate.getForObject(movieUrl, Map.class);
    }

    private Map<String, Object> fetchTheaterDetails(String theaterId) {
        String theaterUrl = String.format(
                "https://places.googleapis.com/v1/places/%s?key=%s",
                theaterId, googleApiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Goog-FieldMask", "displayName,formattedAddress,rating");
        return restTemplate.exchange(
                theaterUrl,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        ).getBody();
    }

    private String extractTheaterName(Map<String, Object> theaterDetails) {
        if (theaterDetails.get("displayName") == null) {
            return "Unknown Theatre";
        }
        return ((Map<String, Object>) theaterDetails.get("displayName")).get("text").toString();
    }

}