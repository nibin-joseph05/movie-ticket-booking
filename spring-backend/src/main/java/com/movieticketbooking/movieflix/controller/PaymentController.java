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
import jakarta.servlet.http.HttpSession;
import com.movieticketbooking.movieflix.models.User;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.api.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.api.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, HttpSession session) {

        System.out.println("Received order request: " + orderRequest);
        System.out.println("Amount: " + orderRequest.getAmount());
        System.out.println("Notes: " + orderRequest.getNotes());
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequestJson = new JSONObject();
            // Explicitly cast to primitive double to avoid ambiguity
            orderRequestJson.put("amount", (double) orderRequest.getAmount() * 100);
            orderRequestJson.put("currency", (Object) "INR");
            orderRequestJson.put("receipt", (Object) orderRequest.getReceipt());
            orderRequestJson.put("payment_capture", (Object) 1);

            // Create notes JSON object separately to avoid ambiguity
            JSONObject notesJson = new JSONObject();
            notesJson.put("userId", (Object) user.getEmail());
            notesJson.put("bookingDetails", (Object) new JSONObject(orderRequest.getNotes()));
            orderRequestJson.put("notes", notesJson);

            Order order = razorpay.orders.create(orderRequestJson);

            JSONObject response = new JSONObject();
            response.put("id", (Object) order.get("id"));
            response.put("amount", (Object) order.get("amount"));
            response.put("currency", (Object) order.get("currency"));
            response.put("key", (Object) razorpayKeyId);

            return ResponseEntity.ok(response.toString());
        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest verificationRequest) {
        try {
            String generatedSignature = HmacUtils.hmacSha256Hex(
                    razorpayKeySecret,
                    verificationRequest.getRazorpayOrderId() + "|" + verificationRequest.getRazorpayPaymentId()
            );

            if (generatedSignature.equals(verificationRequest.getRazorpaySignature())) {
                return ResponseEntity.ok(new JSONObject()
                        .put("status", (Object) "success")
                        .put("orderId", (Object) verificationRequest.getRazorpayOrderId())
                        .put("paymentId", (Object) verificationRequest.getRazorpayPaymentId())
                        .toString());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new JSONObject()
                                .put("status", (Object) "failed")
                                .put("message", (Object) "Payment verification failed")
                                .toString());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new JSONObject()
                            .put("status", (Object) "error")
                            .put("message", (Object) ("Error verifying payment: " + e.getMessage()))
                            .toString());
        }
    }

    // DTO classes remain the same as before
    public static class OrderRequest {
        private double amount;
        private String receipt;
        private Map<String, String> notes;

        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getReceipt() { return receipt; }
        public void setReceipt(String receipt) { this.receipt = receipt; }
        public Map<String, String> getNotes() { return notes; }
        public void setNotes(Map<String, String> notes) { this.notes = notes; }
    }

    public static class PaymentVerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;

        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }
}