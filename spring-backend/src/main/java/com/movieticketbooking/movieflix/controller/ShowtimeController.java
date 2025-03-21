package com.movieticketbooking.movieflix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/showtimes")
@CrossOrigin(origins = "http://localhost:3000")
public class ShowtimeController {

    @GetMapping
    public ResponseEntity<?> getShowtimes(
            @RequestParam String theatreId,
            @RequestParam Long movieId,
            @RequestParam(required = false) String date
    ) {
        LocalDate today = LocalDate.now();
        LocalDate selectedDate = (date != null) ? LocalDate.parse(date) : today;

        if (selectedDate.isAfter(today.plusDays(2))) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Movie is not available for this day."));
        }

        List<String> fixedShowtimes = Arrays.asList("7:00 AM", "10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM");

        List<Map<String, Object>> showtimesResponse = new ArrayList<>();
        for (String time : fixedShowtimes) {
            Map<String, Object> showtimeMap = new HashMap<>();
            showtimeMap.put("theatreId", theatreId);
            showtimeMap.put("movieId", movieId);
            showtimeMap.put("date", selectedDate.toString());
            showtimeMap.put("time", time);
            showtimeMap.put("seatCategories", getSeatPrices());

            showtimesResponse.add(showtimeMap);
        }

        return ResponseEntity.ok(showtimesResponse);
    }

    @GetMapping("/seat-prices")
    public ResponseEntity<List<Map<String, Object>>> getSeatPricesEndpoint() {
        return ResponseEntity.ok(getSeatPrices());
    }

    private List<Map<String, Object>> getSeatPrices() {
        return List.of(
                Map.of("type", "Silver", "seatsAvailable", 40, "price", 140.0),
                Map.of("type", "Gold", "seatsAvailable", 20, "price", 170.0),
                Map.of("type", "Platinum", "seatsAvailable", 10, "price", 210.0)
        );
    }
}
