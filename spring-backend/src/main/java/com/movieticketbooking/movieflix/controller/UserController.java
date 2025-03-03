package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.models.User;
import com.movieticketbooking.movieflix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "user_photos" + File.separator;

    @PostMapping(value = "/register", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<String> registerUser(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("password") String password,
            @RequestParam(value = "userPhotoPath", required = false) MultipartFile file) {

        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }

        if (userService.findByPhoneNumber(phoneNumber).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number is already registered");
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setPassword(password);

        if (file != null && !file.isEmpty()) {
            try {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    boolean created = uploadDir.mkdirs();
                    System.out.println("Upload directory created: " + created);
                }

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File destinationFile = new File(UPLOAD_DIR + fileName);
                file.transferTo(destinationFile);

                String filePath = UPLOAD_DIR + fileName;
                System.out.println("File uploaded successfully: " + filePath);

                user.setUserPhotoPath(filePath);

            } catch (IOException e) {
                System.err.println("Error saving file: " + e.getMessage());
                return ResponseEntity.status(500).body("Error saving file: " + e.getMessage());
            }
        } else {
            System.out.println("No file received in request");
        }

        userService.saveUser(user);
        return ResponseEntity.ok("User Registered Successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        return userService.findByEmail(email)
                .map(user -> {
                    if (!userService.getPasswordEncoder().matches(password, user.getPassword())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Invalid Password"));
                    }
                    userService.generateAndSendOtp(email);
                    return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("error", "Email not registered")));
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> otpRequest) {
        String email = otpRequest.get("email");
        String otp = otpRequest.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        if (userService.verifyOtp(email, otp)) {
            return ResponseEntity.ok(Map.of("message", "Login Successful"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
    }


}
