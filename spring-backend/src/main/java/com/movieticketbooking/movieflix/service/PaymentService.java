//package com.movieticketbooking.movieflix.service;
//
//import com.movieticketbooking.movieflix.models.*;
//import com.movieticketbooking.movieflix.repository.*;
//import com.razorpay.RazorpayClient;
//import com.razorpay.RazorpayException;
//import org.json.JSONObject;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.apache.commons.codec.digest.HmacUtils;
//import jakarta.transaction.Transactional;
//import java.util.Map;
//import com.razorpay.Order;
//
//@Service
//public class PaymentService {
//    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
//
//
//    private final RazorpayClient razorpayClient;
//    private final BookingRepository bookingRepository;
//    private final PaymentRepository paymentRepository;
//    private final String razorpayKeySecret;
//
//    @Autowired
//    public PaymentService(
//            RazorpayClient razorpayClient,
//            BookingRepository bookingRepository,
//            PaymentRepository paymentRepository,
//            @Value("${razorpay.api.key.secret}") String razorpayKeySecret
//    ) {
//        this.razorpayClient = razorpayClient;
//        this.bookingRepository = bookingRepository;
//        this.paymentRepository = paymentRepository;
//        this.razorpayKeySecret = razorpayKeySecret;
//    }
//
//    public JSONObject createOrder(Booking booking, Map<String, String> notes) {
//        log.info("Creating Razorpay order for booking ID: {}", booking.getId());
//
//        try {
//            // 1. Validate booking amount
//            if (booking.getTotalAmount() <= 0) {
//                log.error("Invalid booking amount: {}", booking.getTotalAmount());
//                throw new IllegalArgumentException("Booking amount must be greater than 0");
//            }
//
//            // 2. Prepare order request
//            JSONObject orderRequest = new JSONObject();
//            orderRequest.put("amount", booking.getTotalAmount() * 100); // Convert to paise
//            orderRequest.put("currency", "INR");
//            orderRequest.put("receipt", "txn_" + booking.getId());
//            orderRequest.put("payment_capture", 1);
//
//            if (notes != null && !notes.isEmpty()) {
//                orderRequest.put("notes", new JSONObject(notes));
//            }
//
//            log.debug("Order request payload: {}", orderRequest.toString(2));
//
//            // 3. Create Razorpay order
//            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
//            log.info("Razorpay API response: {}", razorpayOrder.toString());
//
//            // 4. Prepare response
//            JSONObject orderResponse = new JSONObject();
//            orderResponse.put("id", (Object) razorpayOrder.get("id"));
//            orderResponse.put("amount", (Object) razorpayOrder.get("amount"));
//            orderResponse.put("currency", (Object) razorpayOrder.get("currency"));
//            orderResponse.put("receipt", (Object) razorpayOrder.get("receipt"));
//            orderResponse.put("status", (Object) razorpayOrder.get("status"));
//
//            log.debug("Order response prepared: {}", orderResponse.toString(2));
//            return orderResponse;
//
//        } catch (RazorpayException e) {
//            log.error("Razorpay API failure - Message: {}", e.getMessage(), e);
//            throw new RuntimeException("Payment gateway error: " + e.getMessage());
//        } catch (Exception e) {
//            log.error("Order creation failed for booking {}", booking.getId(), e);
//            throw new RuntimeException("Order processing failed: " + e.getMessage());
//        }
//    }
//
//    @Transactional
//    public Payment verifyAndCompletePayment(String paymentId, String orderId, String signature) {
//        log.info("Verifying payment - PaymentID: {}, OrderID: {}", paymentId, orderId);
//
//        try {
//            // 1. Verify signature
//            String generatedSignature = new HmacUtils("HmacSHA256", razorpayKeySecret)
//                    .hmacHex(orderId + "|" + paymentId);
//
//            if (!generatedSignature.equals(signature)) {
//                log.error("Signature verification failed. Expected: {}, Actual: {}",
//                        generatedSignature, signature);
//                throw new SecurityException("Invalid payment signature");
//            }
//
//            // 2. Fetch order details
//            Order razorpayOrder = razorpayClient.orders.fetch(orderId);
//            JSONObject order = new JSONObject(razorpayOrder.toString());
//            log.debug("Fetched Razorpay order: {}", order.toString(2));
//
//            // 3. Extract booking ID
//            JSONObject notes = order.getJSONObject("notes");
//            Long bookingId = notes.getLong("bookingId");
//            log.debug("Extracted booking ID: {}", bookingId);
//
//            // 4. Update booking status
//            Booking booking = bookingRepository.findById(bookingId)
//                    .orElseThrow(() -> {
//                        log.error("Booking not found: {}", bookingId);
//                        return new RuntimeException("Booking not found");
//                    });
//
//            booking.setPaymentStatus("PAID");
//            bookingRepository.save(booking);
//            log.info("Booking {} marked as PAID", bookingId);
//
//            // 5. Create payment record
//            Payment payment = new Payment();
//            payment.setBooking(booking);
//            payment.setTransactionId(paymentId);
//            payment.setAmount(order.getDouble("amount") / 100);
//            payment.setStatus(Payment.PaymentStatus.SUCCESSFUL);
//            payment.setMethod(Payment.PaymentMethod.UPI);
//
//            Payment savedPayment = paymentRepository.save(payment);
//            log.info("Payment record created: {}", savedPayment.getId());
//
//            return savedPayment;
//
//        } catch (Exception e) {
//            log.error("Payment verification failed", e);
//            throw new RuntimeException("Payment verification failed: " + e.getMessage());
//        }
//    }
//}