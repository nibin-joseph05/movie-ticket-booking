package com.moviebooking.movieticketbooking.controller;

import com.moviebooking.movieticketbooking.entity.User;
import com.moviebooking.movieticketbooking.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    private static final String UPLOAD_DIR = "uploads/";

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        System.out.println("🔥 UserController initialized!");
    }

    @GetMapping("/test")
    public String testApi() {
        return "✅ UserController is working!";
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.badRequest().body("Email already registered!");
            }

            User savedUser = userRepository.save(user);

            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error registering user: " + e.getMessage());
        }
    }


    @GetMapping("/session-user")
    public User getSessionUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "Logged Out Successfully";
    }

    @PostMapping("/upload/{userId}")
    public ResponseEntity<String> uploadImage(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());

            String fileUrl = "/api/auth/images/" + fileName;
            User user = userRepository.findById(userId).orElseThrow();
            user.setUserPhotoPath(fileUrl);

            userRepository.save(user);

            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed");
        }
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR + filename);
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(path.toUri());

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
