package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.models.User;
import com.movieticketbooking.movieflix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        Optional<User> existingUser = userService.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }
        Optional<User> existingPhoneNumber = userService.findByPhoneNumber(user.getPhoneNumber());
        if (existingPhoneNumber.isPresent()){
            return ResponseEntity.badRequest().body("Phone number is already registered");
        }

        userService.saveUser(user);
        return ResponseEntity.ok("User Registered Successfully");
    }
}
