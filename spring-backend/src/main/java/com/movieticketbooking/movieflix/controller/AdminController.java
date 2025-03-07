package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.models.Admin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.movieticketbooking.movieflix.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Register an admin
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin admin) {
        Admin savedAdmin = adminService.registerAdmin(admin);
        return ResponseEntity.ok(savedAdmin);
    }

    // Admin login
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
}
