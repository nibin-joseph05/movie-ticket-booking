package com.movieticketbooking.movieflix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/showtimes")
@CrossOrigin(origins = "http://localhost:3000")
public class ShowtimesController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getShowtimes(
            @RequestParam String theatreId,
            @RequestParam String movieId
    ) {
        List<Map<String, Object>> showtimes = new ArrayList<>();

        String[] times = {"10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"};

        for (String time : times) {
            Map<String, Object> show = new HashMap<>();
            show.put("time", time);
            show.put("availableSeats", new Random().nextInt(50) + 10);  // Random seats (10-60)
            showtimes.add(show);
        }

        return ResponseEntity.ok(showtimes);
    }
}
