package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.models.Theatre;
import com.movieticketbooking.movieflix.service.TheatreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/theatres")
@CrossOrigin(origins = "http://localhost:3000")
public class TheatreController {

    private final TheatreService theatreService;

    public TheatreController(TheatreService theatreService) {
        this.theatreService = theatreService;
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Theatre>> getNearbyTheatres(@RequestParam double lat, @RequestParam double lon) {
        return ResponseEntity.ok(theatreService.getNearbyTheatres(lat, lon));
    }

    @PostMapping("/save")
    public ResponseEntity<Theatre> saveTheatre(@RequestBody Theatre theatre) {
        Theatre savedTheatre = theatreService.saveTheatre(theatre);
        return savedTheatre != null ? ResponseEntity.ok(savedTheatre) : ResponseEntity.badRequest().build();
    }
}
