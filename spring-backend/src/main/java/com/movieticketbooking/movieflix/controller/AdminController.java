package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.dto.BookingDetailsDTO;
import com.movieticketbooking.movieflix.dto.BookingListDTO;
import com.movieticketbooking.movieflix.dto.ProfitSummary;
import com.movieticketbooking.movieflix.models.Admin;
import com.movieticketbooking.movieflix.models.Booking;
import com.movieticketbooking.movieflix.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.movieticketbooking.movieflix.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = "https://movieflix-sooty.vercel.app")
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin admin) {
        Admin savedAdmin = adminService.registerAdmin(admin);
        return ResponseEntity.ok(savedAdmin);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        boolean isAuthenticated = adminService.authenticateAdmin(email, password);

        if (isAuthenticated) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }


    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        try {
            List<User> users = adminService.getFilteredUsers(search, limit, offset);
            long totalUsers = adminService.countFilteredUsers(search);

            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("total", totalUsers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching users"));
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingListDTO>> getBookings(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getBookingList(search, page, size));
    }

    @GetMapping("/bookings/{reference}")
    public ResponseEntity<BookingDetailsDTO> getBookingDetails(
            @PathVariable String reference
    ) {
        return adminService.getBookingDetails(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profit")
    public ResponseEntity<ProfitSummary> getProfitSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        try {
            LocalDateTime startDateTime = start.atStartOfDay();
            LocalDateTime endDateTime = end.atTime(23, 59, 59);

            ProfitSummary summary = adminService.getProfitSummary(startDateTime, endDateTime);
            return ResponseEntity.ok(summary);

        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}
