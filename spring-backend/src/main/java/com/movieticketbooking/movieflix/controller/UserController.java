package com.movieticketbooking.movieflix.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticketbooking.movieflix.models.User;
import com.movieticketbooking.movieflix.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.io.File;
import java.util.Optional;
import java.util.UUID;
import jakarta.servlet.http.HttpSession;


@RestController
@CrossOrigin(origins = "https://movieflix-sooty.vercel.app", allowCredentials = "true")
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

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
                    userService.generateAndSendOtp(email, "LOGIN");
                    return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("error", "Email not registered")));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> otpRequest, HttpSession session) {
        String email = otpRequest.get("email");
        String otp = otpRequest.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        Optional<User> optionalUser = userService.findByEmail(email);
        if (optionalUser.isPresent() && userService.verifyOtp(email, otp, "LOGIN")) {
            User user = optionalUser.get();
            session.setAttribute("user", user);

            // Return user details to the frontend
            return ResponseEntity.ok(Map.of(
                    "message", "Login Successful",
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "email", user.getEmail(),
                    "phoneNumber", user.getPhoneNumber()
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            Optional<User> dbUser = userService.findByEmail(user.getEmail());
            if (dbUser.isPresent()) {
                User currentUser = dbUser.get();

                // Handle potential null values
                return ResponseEntity.ok(Map.of(
                        "isLoggedIn", true,
                        "user", Map.of(
                                "id", currentUser.getUserId(),
                                "firstName", currentUser.getFirstName() != null ? currentUser.getFirstName() : "",
                                "lastName", currentUser.getLastName() != null ? currentUser.getLastName() : "",
                                "email", currentUser.getEmail() != null ? currentUser.getEmail() : "",
                                "phoneNumber", currentUser.getPhoneNumber() != null ? currentUser.getPhoneNumber() : "",
                                "photoPath", currentUser.getUserPhotoPath() != null ? currentUser.getUserPhotoPath() : ""
                        )
                ));
            }
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("isLoggedIn", false));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully!");
    }

    @GetMapping("/login/google-auth")
    public void googleAuthCallback(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestParam(name = "state", required = false) String state,
            HttpSession session,
            HttpServletResponse response) throws IOException {

        if (oauth2User == null) {
            response.sendRedirect("https://movieflix-sooty.vercel.app/login?error=google_auth_failed");
            return;
        }

        String email = oauth2User != null ? oauth2User.getAttribute("email") : null;
        String googleId = oauth2User != null ? oauth2User.getAttribute("sub") : null;

        if (email == null || googleId == null) {
            response.sendRedirect("https://movieflix-sooty.vercel.app/login?error=invalid_google_response");
            return;
        }


        Optional<User> optionalUser = userService.findByEmail(email);
        if (optionalUser.isEmpty()) {
            String encodedEmail = URLEncoder.encode(email, "UTF-8");
            String encodedState = state != null ? URLEncoder.encode(state, "UTF-8") : "";

            response.sendRedirect(
                    "https://movieflix-sooty.vercel.app/login?error=no_account" +
                            "&message=Account+not+found.+Please+register." +
                            "&email=" + encodedEmail +
                            "&from=google" +
                            "&state=" + encodedState
            );
            return;
        }

        // Update google_id if not already present
        User user = optionalUser.get();
        if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
            user.setGoogleId(googleId);
            userService.saveUserWithoutEncodingPassword(user); // Add this method separately
        }

        session.setAttribute("user", user);

        // Handle returnUrl from state
        String returnUrl = "/";
        if (state != null && !state.isEmpty()) {
            try {
                Map<String, String> stateMap = new ObjectMapper().readValue(URLDecoder.decode(state, "UTF-8"),
                        new TypeReference<Map<String, String>>() {});
                returnUrl = stateMap.getOrDefault("returnUrl", "/");
            } catch (Exception e) {
                // ignore and fallback
            }
        }

        response.sendRedirect("https://movieflix-sooty.vercel.app" + returnUrl);
    }

    @GetMapping("/photo")
    public ResponseEntity<Resource> getUserPhoto(@RequestParam String path) {
        try {
            if (path == null || path.trim().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(path);

            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(filePath);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (InvalidPathException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error loading photo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/details")
    public ResponseEntity<?> getUserDetails(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        Optional<User> dbUser = userService.findByEmail(user.getEmail());
        if (dbUser.isEmpty()) {
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        User currentUser = dbUser.get();
        return ResponseEntity.ok(Map.of(
                "id", currentUser.getUserId(),
                "firstName", currentUser.getFirstName() != null ? currentUser.getFirstName() : "",
                "lastName", currentUser.getLastName() != null ? currentUser.getLastName() : "",
                "email", currentUser.getEmail() != null ? currentUser.getEmail() : "",
                "phoneNumber", currentUser.getPhoneNumber() != null ? currentUser.getPhoneNumber() : "",
                "photoPath", currentUser.getUserPhotoPath() != null ? currentUser.getUserPhotoPath() : ""
        ));
    }

    @PutMapping(value = "/update", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> updateUser(
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "verificationCode", required = false) String verificationCode,
            @RequestParam(value = "userPhotoPath", required = false) MultipartFile file,
            HttpSession session) {

        User sessionUser = (User) session.getAttribute("user");
        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        Optional<User> optionalUser = userService.findByEmail(sessionUser.getEmail());
        if (optionalUser.isEmpty()) {
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();
        boolean isPhoneNumberChanged = false;

        if (phoneNumber != null) {
            // Check if phone number is already taken by another user
            Optional<User> existingUser = userService.findByPhoneNumber(phoneNumber);
            if (existingUser.isPresent() && existingUser.get().getUserId() != user.getUserId()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number already in use"));
            }

            if (phoneNumber.length() != 10 || !phoneNumber.matches("\\d+")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number must be 10 digits"));
            }
            isPhoneNumberChanged = !phoneNumber.equals(user.getPhoneNumber());
        }


        // Handle phone number change verification
        if (isPhoneNumberChanged) {
            if (verificationCode == null || verificationCode.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Verification code required for phone number change"));
            }
            if (!userService.verifyOtp(user.getEmail(), verificationCode, "PHONE_UPDATE")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification code"));
            }
        }

        // Update user details
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);

        if (file != null && !file.isEmpty()) {
            try {
                // Delete old photo if exists
                if (user.getUserPhotoPath() != null) {
                    File oldPhoto = new File(user.getUserPhotoPath());
                    if (oldPhoto.exists()) {
                        oldPhoto.delete();
                    }
                }

                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File destinationFile = new File(UPLOAD_DIR + fileName);
                file.transferTo(destinationFile);

                user.setUserPhotoPath(UPLOAD_DIR + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to upload photo"));
            }
        }

        userService.saveUserWithoutEncodingPassword(user);
        session.setAttribute("user", user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> passwordRequest,
            HttpSession session) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        String currentPassword = passwordRequest.get("currentPassword");
        String newPassword = passwordRequest.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both current and new password are required"));
        }

        Optional<User> optionalUser = userService.findByEmail(user.getEmail());
        if (optionalUser.isEmpty()) {
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        User dbUser = optionalUser.get();

        if (!userService.getPasswordEncoder().matches(currentPassword, dbUser.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }

        dbUser.setPassword(newPassword);
        userService.saveUser(dbUser);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationCode(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        try {
            userService.generateAndSendOtp(user.getEmail(), "PHONE_UPDATE");
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send verification code"));
        }
    }

    // Add resend OTP endpoint
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String purpose = request.get("purpose");

        if (email == null || purpose == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and purpose are required"));
        }

        if (!userService.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email not registered"));
        }

        try {
            userService.generateAndSendOtp(email, purpose);
            return ResponseEntity.ok(Map.of("message", "New OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to resend OTP"));
        }
    }

    // Updated reset password endpoint with validation
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        // Validation
        if (email == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }

        Optional<User> userOptional = userService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        User user = userOptional.get();
        user.setPassword(newPassword);
        userService.saveUser(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // Updated forgot password endpoint with email validation
    @PostMapping("/forgot-password")
    public ResponseEntity<?> initiatePasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        // Email format validation
        if (!email.matches("^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
        }

        Optional<User> userOptional = userService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email not registered"));
        }

        userService.generateAndSendOtp(email, "PASSWORD_RESET");
        return ResponseEntity.ok(Map.of("message", "OTP sent to registered email"));
    }

    // Updated OTP verification with validation
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        // OTP validation
        if (!otp.matches("\\d{6}")) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP must be 6 digits"));
        }

        if (userService.verifyOtp(email, otp, "PASSWORD_RESET")) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
    }



}
