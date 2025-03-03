package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.models.User;
import com.movieticketbooking.movieflix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public void generateAndSendOtp(String email){
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);
        emailService.sendEmail(email, "Your OTP Code", "Your OTP for login is: " + otp);
    }
    public boolean verifyOtp(String email, String otp){
        if(otpStorage.containsKey(email) && otpStorage.get(email).equals(otp)) {
            otpStorage.remove(email);
            return true;
        }
        return false;
    }

    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }



}
