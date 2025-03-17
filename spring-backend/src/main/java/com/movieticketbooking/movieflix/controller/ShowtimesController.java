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

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getShowtimes(
            @RequestParam String theatreId,
            @RequestParam String movieId,
            @RequestParam(required = false) String date
    ) {
        List<Map<String, Object>> showtimes = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate selectedDate = (date != null) ? LocalDate.parse(date) : today;

        if (selectedDate.isBefore(today) || selectedDate.isAfter(today.plusDays(3))) {
            return ResponseEntity.badRequest().build();
        }

        Random random = new Random();
        for (String time : TIMES) {
            Map<String, Object> show = new HashMap<>();
            show.put("time", time);
            show.put("availableSeats", random.nextInt(50) + 10);
            show.put("price", random.nextInt(100) + 150);
            show.put("date", selectedDate.toString());

            showtimes.add(show);
        }

        return ResponseEntity.ok(showtimes);
    }
}
