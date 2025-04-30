package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.dto.BookingDetailsDTO;
import com.movieticketbooking.movieflix.dto.BookingListDTO;
import com.movieticketbooking.movieflix.models.Admin;
import com.movieticketbooking.movieflix.models.Booking;
import com.movieticketbooking.movieflix.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.movieticketbooking.movieflix.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
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


}
