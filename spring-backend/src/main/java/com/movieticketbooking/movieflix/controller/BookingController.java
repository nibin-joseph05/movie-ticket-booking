package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.models.*;
import com.movieticketbooking.movieflix.repository.*;
import com.movieticketbooking.movieflix.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.*;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;
import java.time.format.DateTimeParseException;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/booking")
public class BookingController {

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${google.api.key}")
    private String googleApiKey;

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private TicketService ticketService;

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

            // Create a formatter for AM/PM time format
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a", Locale.US);

            for (Booking booking : bookings) {
                Showtime showtime = showtimeRepository.findById(booking.getShowtime().getId())
                        .orElse(null);

                if (showtime != null) {
                    Map<String, Object> movieDetails = fetchMovieDetails(showtime.getMovieId().toString());

                    if (movieDetails != null) {
                        // Format the date properly
                        String formattedDate = showtime.getDate().toString();

                        // Parse the time using the formatter
                        LocalTime showTime = LocalTime.parse(showtime.getTime(), timeFormatter);
                        LocalDateTime showDateTime = showtime.getDate().atTime(showTime);
                        LocalDateTime now = LocalDateTime.now();

                        boolean isExpired = showDateTime.isBefore(now);
                        long hoursRemaining = ChronoUnit.HOURS.between(now, showDateTime);
                        long minutesRemaining = ChronoUnit.MINUTES.between(now, showDateTime) % 60;

                        String timeStatus = isExpired ? "Expired" :
                                (hoursRemaining > 0 ? hoursRemaining + "h " + minutesRemaining + "m remaining" :
                                        minutesRemaining + "m remaining");

                        // Create booking map using HashMap
                        Map<String, Object> bookingMap = new HashMap<>();
                        bookingMap.put("id", booking.getId());
                        bookingMap.put("reference", booking.getBookingReference());
                        bookingMap.put("movieTitle", movieDetails.get("title"));
                        bookingMap.put("posterPath", buildPosterPath(movieDetails.get("poster_path")));
                        bookingMap.put("showtime", showtime.getTime()); // Keep original format
                        bookingMap.put("date", formattedDate);
                        bookingMap.put("totalAmount", booking.getTotalAmount());
                        bookingMap.put("status", booking.getPaymentStatus());
                        bookingMap.put("rating", movieDetails.getOrDefault("vote_average", "N/A"));
                        bookingMap.put("genres", extractGenres(movieDetails));
                        bookingMap.put("isExpired", isExpired);
                        bookingMap.put("timeStatus", timeStatus);
                        bookingMap.put("showDateTime", showDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

                        bookingResponses.add(bookingMap);
                    }
                }
            }

            // Create response map
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", bookingResponses);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to fetch user bookings: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
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


    @GetMapping("/{bookingRef}/ticket")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable String bookingRef) {
        try {
            // Get booking details
            Booking booking = bookingRepository.findByBookingReference(bookingRef)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            Showtime showtime = showtimeRepository.findById(booking.getShowtime().getId())
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));

            List<BookedSeat> seats = bookedSeatRepository.findByBookingId(booking.getId());
            List<FoodOrder> foodOrders = foodOrderRepository.findByBookingId(booking.getId());

            Map<String, Object> movieDetails = fetchMovieDetails(showtime.getMovieId().toString());
            Map<String, Object> theaterDetails = fetchTheaterDetails(showtime.getTheatreId());

            // Generate PDF
            byte[] ticketPdf = ticketService.generateTicketPdf(
                    booking, showtime, seats, foodOrders, movieDetails, theaterDetails);

            // Return PDF for download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "ticket_" + booking.getBookingReference() + ".pdf");

            return new ResponseEntity<>(ticketPdf, headers, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error generating ticket for booking " + bookingRef, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error generating ticket: " + e.getMessage()).getBytes());
        }
    }

    @PostMapping("/{bookingRef}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingRef) {
        try {
            // 1. Find the booking
            Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(bookingRef);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of(
                                "status", "error",
                                "code", "BOOKING_NOT_FOUND",
                                "message", "No booking found with reference: " + bookingRef
                        )
                );
            }

            Booking booking = bookingOpt.get();

            // 2. Check booking status - note we use string literals to match database values
            if ("CANCELLED".equals(booking.getPaymentStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                        Map.of(
                                "status", "error",
                                "code", "ALREADY_CANCELLED",
                                "message", "This booking was already cancelled"
                        )
                );
            }

            if ("FAILED".equals(booking.getPaymentStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        Map.of(
                                "status", "error",
                                "code", "PAYMENT_FAILED",
                                "message", "Cannot cancel a failed payment booking"
                        )
                );
            }

            // 3. Validate showtime
            Optional<Showtime> showtimeOpt = showtimeRepository.findById(booking.getShowtime().getId());
            if (showtimeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                        Map.of(
                                "status", "error",
                                "code", "SHOWTIME_NOT_FOUND",
                                "message", "Associated showtime no longer exists"
                        )
                );
            }

            Showtime showtime = showtimeOpt.get();

            // Parse showtime with proper error handling
            LocalTime showTime;
            try {
                showTime = LocalTime.parse(showtime.getTime(), DateTimeFormatter.ofPattern("h:mm a", Locale.US));
            } catch (DateTimeParseException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        Map.of(
                                "status", "error",
                                "code", "INVALID_SHOWTIME_FORMAT",
                                "message", "Showtime format is invalid"
                        )
                );
            }

            // Check showtime with timezone awareness
            LocalDateTime showDateTime = showtime.getDate().atTime(showTime)
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            if (showDateTime.isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        Map.of(
                                "status", "error",
                                "code", "SHOWTIME_PASSED",
                                "message", "Cannot cancel booking after showtime has started",
                                "showtime", showDateTime.toString()
                        )
                );
            }

            // 4. Process cancellation - use string literal to match database
            booking.setPaymentStatus("CANCELLED");
            bookingRepository.save(booking);


            List<BookedSeat> seatsToRelease = bookedSeatRepository.findByBookingId(booking.getId());
            if (!seatsToRelease.isEmpty()) {
                bookedSeatRepository.deleteAll(seatsToRelease);
            }

            // 5. Update payment status if exists
            Payment payment = paymentRepository.findByBookingId(booking.getId());
            if (payment != null && "SUCCESSFUL".equals(payment.getStatus())) {
                payment.setStatus(Payment.PaymentStatus.REFUND_PENDING); // Use enum here
                paymentRepository.save(payment);
            }

            return ResponseEntity.ok(
                    Map.of(
                            "status", "success",
                            "message", "Booking cancelled successfully",
                            "booking_reference", booking.getBookingReference(),
                            "refund_status", payment != null ? payment.getStatus().name() : "no_payment",
                            "cancellation_time", LocalDateTime.now().toString()
                    )
            );

        } catch (Exception e) {
            logger.error("System error cancelling booking {}: {}", bookingRef, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "status", "error",
                            "code", "SYSTEM_ERROR",
                            "message", "An unexpected error occurred",
                            "details", e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/booked-seats")
    public ResponseEntity<?> getBookedSeats(
            @RequestParam Long movieId,
            @RequestParam String theaterId,
            @RequestParam String showtime,
            @RequestParam String date) {

        try {
            LocalDate parsedDate = LocalDate.parse(date);

            List<String> bookedSeats = bookedSeatRepository.findBookedSeatsByMovieTheaterShowtimeAndDate(
                    movieId, theaterId, showtime, parsedDate);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "bookedSeats", bookedSeats
            ));

        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("status", "error", "message", "Invalid date format. Use yyyy-MM-dd")
            );
        } catch (Exception e) {
            logger.error("Error fetching booked seats for movie {} theater {} showtime {} date {}",
                    movieId, theaterId, showtime, date, e);
            return ResponseEntity.internalServerError().body(
                    Map.of("status", "error", "message", "Failed to fetch booked seats")
            );
        }
    }

}