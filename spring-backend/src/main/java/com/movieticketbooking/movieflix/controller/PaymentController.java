package com.movieticketbooking.movieflix.controller;

import com.movieticketbooking.movieflix.service.PaymentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.movieticketbooking.movieflix.models.User;

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
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentService.PaymentVerificationRequest verificationRequest) {
        return paymentService.verifyAndCompletePayment(verificationRequest);
    }
}