package com.movieticketbooking.movieflix.controller;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.apache.commons.codec.digest.HmacUtils;
import lombok.Data;
import jakarta.servlet.http.HttpSession;  // Add this import
import com.movieticketbooking.movieflix.models.User;  // Add this import if User class exists in your models

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.api.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.api.key.secret}")
    private String razorpayKeySecret;

    // Create order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, HttpSession session) {
        // Check if user is logged in
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        // Rest of your order creation logic
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequestJson = new JSONObject();
            orderRequestJson.put("amount", orderRequest.getAmount() * 100);
            orderRequestJson.put("currency", "INR");
            orderRequestJson.put("receipt", orderRequest.getReceipt());
            orderRequestJson.put("payment_capture", 1);

            // Add user email to notes
            orderRequestJson.put("notes", new JSONObject()
                    .put("userId", user.getEmail())
                    .put("bookingDetails", orderRequest.getNotes()));

            Order order = razorpay.orders.create(orderRequestJson);

            return ResponseEntity.ok(order.toString());
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating order: " + e.getMessage());
        }
    }

    // Verify payment signature
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest verificationRequest) {
        try {
            String generatedSignature = HmacUtils.hmacSha256Hex(
                    razorpayKeySecret,
                    verificationRequest.getRazorpayOrderId() + "|" + verificationRequest.getRazorpayPaymentId()
            );

            if (generatedSignature.equals(verificationRequest.getRazorpaySignature())) {
                return ResponseEntity.ok("Payment verified successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Payment verification failed");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying payment: " + e.getMessage());
        }
    }

    // DTO classes
    @Data
    public static class OrderRequest {
        private int amount;
        private String receipt;
        private JSONObject notes;  // Add this field to store notes
    }

    @Data
    public static class PaymentVerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }
}