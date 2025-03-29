package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.service.PaymentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.movieticketbooking.movieflix.models.User;

import java.util.Map;


@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody PaymentService.OrderRequest orderRequest, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"status\":\"error\",\"message\":\"User not logged in\"}");
        }
        return paymentService.createPaymentOrder(orderRequest, user.getEmail());
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentService.PaymentVerificationRequest verificationRequest,
            HttpSession session) {  // Add HttpSession parameter

        // Get user from session
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        // Set the user email in the verification request
        verificationRequest.setUserEmail(user.getEmail());

        return paymentService.verifyAndCompletePayment(verificationRequest);
    }
}