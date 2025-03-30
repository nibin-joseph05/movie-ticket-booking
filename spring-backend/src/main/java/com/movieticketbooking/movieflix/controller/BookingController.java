package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.models.*;
import com.movieticketbooking.movieflix.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
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

    private final RestTemplate restTemplate;
    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final PaymentRepository paymentRepository;
    private final BookedSeatRepository bookedSeatRepository;
    private final FoodOrderRepository foodOrderRepository;
    private final FoodItemRepository foodItemRepository;

    public BookingController(RestTemplate restTemplate,
                             BookingRepository bookingRepository,
                             ShowtimeRepository showtimeRepository,
                             PaymentRepository paymentRepository,
                             BookedSeatRepository bookedSeatRepository,
                             FoodOrderRepository foodOrderRepository,
                             FoodItemRepository foodItemRepository) {
        this.restTemplate = restTemplate;
        this.bookingRepository = bookingRepository;
        this.showtimeRepository = showtimeRepository;
        this.paymentRepository = paymentRepository;
        this.bookedSeatRepository = bookedSeatRepository;
        this.foodOrderRepository = foodOrderRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @GetMapping("/{bookingRef}")
    public ResponseEntity<?> getBookingDetails(@PathVariable String bookingRef) {
        try {
            // Try to find by Razorpay order ID first
            Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(bookingRef);

            if (bookingOpt.isEmpty()) {
                // Fallback to database ID
                try {
                    Long id = Long.parseLong(bookingRef);
                    bookingOpt = bookingRepository.findById(id);
                } catch (NumberFormatException e) {
                    return ResponseEntity.status(404).body(
                            Map.of("status", "error", "message", "Booking not found")
                    );
                }
            }

            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(404).body(
                        Map.of("status", "error", "message", "Booking not found")
                );
            }

            Booking booking = bookingOpt.get();
            Showtime showtime = showtimeRepository.findById(booking.getShowtime().getId())
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));
            Payment payment = paymentRepository.findByBookingId(booking.getId());
            List<BookedSeat> seats = bookedSeatRepository.findByBookingId(booking.getId());
            List<FoodOrder> foodOrders = foodOrderRepository.findByBookingId(booking.getId());

            // Fetch additional details
            Map<String, Object> movieDetails = fetchMovieDetails(showtime.getMovieId().toString());
            Map<String, Object> theaterDetails = fetchTheaterDetails(showtime.getTheatreId());

            if (movieDetails == null || theaterDetails == null) {
                return ResponseEntity.status(500).body(
                        Map.of("status", "error", "message", "Failed to fetch movie or theater details")
                );
            }

            // Build response
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "success");
            response.put("data", buildBookingResponse(booking, showtime, payment, seats, foodOrders, movieDetails, theaterDetails));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("status", "error", "message", "Internal server error: " + e.getMessage())
            );
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        try {
            List<Booking> bookings = bookingRepository.findByUserId(userId);
            List<Map<String, Object>> bookingResponses = new ArrayList<>();

            for (Booking booking : bookings) {
                Showtime showtime = showtimeRepository.findById(booking.getShowtime().getId())
                        .orElse(null);

                if (showtime != null) {
                    Map<String, Object> movieDetails = fetchMovieDetails(showtime.getMovieId().toString());

                    if (movieDetails != null) {
                        bookingResponses.add(Map.of(
                                "id", booking.getId(),
                                "reference", booking.getBookingReference(),
                                "movieTitle", movieDetails.get("title"),
                                "posterPath", buildPosterPath(movieDetails.get("poster_path")),
                                "showtime", showtime.getTime(),
                                "date", showtime.getDate().toString(),
                                "totalAmount", booking.getTotalAmount(),
                                "status", booking.getPaymentStatus()
                        ));
                    }
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "data", bookingResponses
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("status", "error", "message", "Failed to fetch user bookings: " + e.getMessage())
            );
        }
    }

    private Map<String, Object> buildBookingResponse(Booking booking,
                                                     Showtime showtime,
                                                     Payment payment,
                                                     List<BookedSeat> seats,
                                                     List<FoodOrder> foodOrders,
                                                     Map<String, Object> movieDetails,
                                                     Map<String, Object> theaterDetails) {
        Map<String, Object> response = new LinkedHashMap<>();

        // Booking details
        response.put("booking", Map.of(
                "id", booking.getId(),
                "reference", booking.getBookingReference(),
                "date", showtime.getDate().toString(),
                "time", showtime.getTime(),
                "totalAmount", booking.getTotalAmount(),
                "seats", seats.stream().map(BookedSeat::getSeatNumber).collect(Collectors.toList()),
                "paymentStatus", booking.getPaymentStatus(),
                "paymentMethod", payment != null ? payment.getMethod().toString() : "UNKNOWN",
                "bookingTime", booking.getBookingTime().toString()
        ));

        // Food items
        if (!foodOrders.isEmpty()) {
            response.put("foodItems", foodOrders.stream()
                    .map(fo -> {
                        FoodItem foodItem = foodItemRepository.findById(fo.getFoodItem().getId())
                                .orElse(new FoodItem());
                        return Map.of(
                                "name", foodItem.getName(),
                                "quantity", fo.getQuantity(),
                                "price", fo.getPriceAtOrder(),
                                "imageUrl", foodItem.getImageUrl()
                        );
                    })
                    .collect(Collectors.toList())
            );
        }

        // Movie details
        response.put("movie", Map.of(
                "title", movieDetails.get("title"),
                "posterPath", buildPosterPath(movieDetails.get("poster_path")),
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


    @GetMapping("/details")
    public ResponseEntity<Map<String, Object>> getBookingDetails(
            @RequestParam String movieId,
            @RequestParam String theaterId) {

        Map<String, Object> movieDetails = fetchMovieDetails(movieId);
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

        response.put("movie", Map.of(
                "name", movieDetails.get("title"),
                "posterPath", buildPosterPath(movieDetails.get("poster_path")),
                "releaseDate", movieDetails.get("release_date"),
                "genres", extractGenres(movieDetails),
                "rating", movieDetails.getOrDefault("vote_average", "N/A"),
                "synopsis", movieDetails.get("overview")
        ));

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
}