package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.models.User;
import com.movieticketbooking.movieflix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private final Map<String, String> otpStorage = new HashMap<>();

    public User saveUser(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    public Optional<User> findByPhoneNumber(String phoneNumber){
        return userRepository.findByPhoneNumber(phoneNumber);
    }



    public boolean verifyOtp(String email, String otp) {
        return verifyOtp(email, otp, "LOGIN"); // Default to LOGIN purpose
    }

    // Modified method with purpose parameter
    public boolean verifyOtp(String email, String otp, String purpose) {
        String key = email + ":" + purpose;
        System.out.println("Verifying OTP for key: " + key);

        if (otpStorage.containsKey(key) && otpStorage.get(key).equals(otp)) {
            otpStorage.remove(key);
            return true;
        }
        return false;
    }

    // Update existing generateAndSendOtp method
    public void generateAndSendOtp(String email, String purpose) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        String storageKey = email + ":" + purpose;
        otpStorage.put(storageKey, otp);

        String subject;
        switch (purpose) {
            case "PHONE_UPDATE":
                subject = "Phone Number Change Verification Code";
                break;
            case "PASSWORD_RESET":
                subject = "Password Reset Verification Code";
                break;
            default:
                subject = "Your Login OTP Code";
        }

        emailService.sendEmail(email, subject, otp, purpose);
        System.out.println("Generated OTP for " + email + " (" + purpose + "): " + otp);
    }

    public User saveUserWithoutEncodingPassword(User user) {
        return userRepository.save(user);
    }



    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }


}
