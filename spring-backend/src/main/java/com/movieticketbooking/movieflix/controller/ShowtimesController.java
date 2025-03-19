package com.movieticketbooking.movieflix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/showtimes")
@CrossOrigin(origins = "http://localhost:3000")
public class ShowtimesController {

    private static final String[] TIMES = {"10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"};

    // Simulating seat storage
    private static final Map<String, Integer> theatreSeatMap = new HashMap<>();

    @GetMapping
    public ResponseEntity<?> getShowtimes(
            @RequestParam String theatreId,
            @RequestParam String movieId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String category  // Gold or Platinum
    ) {
        LocalDate today = LocalDate.now();
        LocalDate selectedDate = (date != null) ? LocalDate.parse(date) : today;

        // Movie availability restriction (not available after 2 days)
        if (selectedDate.isAfter(today.plusDays(2))) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Movie is not available for this day."));
        }

        // Determine movie type (Assuming 3D movieId ends with "_3D")
        boolean isThreeD = movieId.endsWith("_3D");

        // Fixed pricing logic based on category
        int basePrice = isThreeD ? 210 : 170;
        int platinumPrice = 210;
        int goldPrice = isThreeD ? 310 : 210;

        // Fixed seat count per theatre
        int totalSeats = theatreSeatMap.computeIfAbsent(theatreId, k -> new Random().nextInt(31) + 70); // 70-100 seats

        // Generate showtimes
        List<Map<String, Object>> showtimes = new ArrayList<>();
        for (String time : TIMES) {
            Map<String, Object> show = new HashMap<>();
            show.put("time", time);
            show.put("availableSeats", totalSeats);  // Same for all showtimes
            show.put("price", category != null && category.equalsIgnoreCase("gold") ? goldPrice : platinumPrice);
            show.put("date", selectedDate.toString());

            showtimes.add(show);
        }

        return ResponseEntity.ok(showtimes);
    }

    // Simulate seat booking
    @PostMapping("/book")
    public ResponseEntity<?> bookSeats(
            @RequestParam String theatreId,
            @RequestParam String movieId,
            @RequestParam String time,
            @RequestParam String date,
            @RequestParam int seats
    ) {
        LocalDate selectedDate = LocalDate.parse(date);
        LocalDate today = LocalDate.now();

        if (selectedDate.isBefore(today) || selectedDate.isAfter(today.plusDays(2))) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Booking not allowed for this date."));
        }

        int totalSeats = theatreSeatMap.getOrDefault(theatreId, 70);
        int availableSeats = totalSeats - seats;

        if (availableSeats < 0) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Not enough seats available."));
        }

        theatreSeatMap.put(theatreId, availableSeats); // Update available seats

        return ResponseEntity.ok(Collections.singletonMap("message", "Booking successful! Remaining seats: " + availableSeats));
    }
}
