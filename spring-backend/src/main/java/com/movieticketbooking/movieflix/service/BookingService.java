package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.models.*;
import com.movieticketbooking.movieflix.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookedSeatRepository bookedSeatRepository;
    @Autowired
    private FoodItemRepository foodItemRepository;
    @Autowired
    private FoodOrderRepository foodOrderRepository;

    // Embedded DTO classes
    public static class BookingRequest {
        private Long showtimeId;
        private Integer userId;
        private double amount;
        private String paymentMethod;
        private List<String> seats;
        private List<FoodOrderRequest> foodItems;

        // Getters and setters
        public Long getShowtimeId() { return showtimeId; }
        public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public List<String> getSeats() { return seats; }
        public void setSeats(List<String> seats) { this.seats = seats; }
        public List<FoodOrderRequest> getFoodItems() { return foodItems; }
        public void setFoodItems(List<FoodOrderRequest> foodItems) { this.foodItems = foodItems; }
    }

    public static class FoodOrderRequest {
        private Long foodItemId;
        private Integer quantity;
        private String specialInstructions;

        // Getters and setters
        public Long getFoodItemId() { return foodItemId; }
        public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) {
            this.specialInstructions = specialInstructions;
        }
    }

    public Booking createBooking(BookingRequest bookingRequest) {
        // Get required entities
        Showtime showtime = showtimeRepository.findById(bookingRequest.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create and save payment
        Payment payment = new Payment();
        payment.setAmount(bookingRequest.getAmount());
        payment.setCurrency("INR");
        payment.setMethod(Payment.PaymentMethod.valueOf(bookingRequest.getPaymentMethod())); // Convert string to enum
        payment.setStatus(Payment.PaymentStatus.PENDING); // Use enum
        payment.setPaymentTime(LocalDateTime.now()); // Use correct method name
        payment = paymentRepository.save(payment);

        // Create and save booking
        Booking booking = new Booking(user, showtime, bookingRequest.getAmount());
        booking.setPayment(payment);
        booking = bookingRepository.save(booking);

        // Add seats with proper price calculation
        if (bookingRequest.getSeats() != null) {
            for (String seatNumber : bookingRequest.getSeats()) {
                BookedSeat seat = new BookedSeat();
                seat.setSeatNumber(seatNumber);
                seat.setPrice(getSeatPrice(showtime, seatNumber)); // Implement this method
                booking.addSeat(seat);
                bookedSeatRepository.save(seat);
            }
        }


        // Add food items
        if (bookingRequest.getFoodItems() != null) {
            for (FoodOrderRequest foodItem : bookingRequest.getFoodItems()) {
                FoodItem item = foodItemRepository.findById(foodItem.getFoodItemId())
                        .orElseThrow(() -> new RuntimeException("Food item not found"));

                FoodOrder foodOrder = new FoodOrder();
                foodOrder.setFoodItem(item);
                foodOrder.setQuantity(foodItem.getQuantity());
                foodOrder.setPriceAtOrder(item.getPrice());
                foodOrder.setSpecialInstructions(foodItem.getSpecialInstructions());
                booking.addFoodOrder(foodOrder);
                foodOrderRepository.save(foodOrder);
            }
        }

        // Recalculate and update total amount
        booking.setTotalAmount(booking.calculateTotalAmount());
        return bookingRepository.save(booking);
    }

    private double getSeatPrice(Showtime showtime, String seatNumber) {
        // Implement logic based on your seat numbering convention
        if (seatNumber.startsWith("S")) return showtime.getSilverPrice();
        if (seatNumber.startsWith("G")) return showtime.getGoldPrice();
        if (seatNumber.startsWith("P")) return showtime.getPlatinumPrice();
        return showtime.getSilverPrice(); // default
    }

    public void confirmBooking(String bookingReference, String paymentId, String transactionId) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"PENDING".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Booking is already processed");
        }

        Payment payment = booking.getPayment();
        payment.setTransactionId(transactionId); // Use correct method
        payment.setStatus(Payment.PaymentStatus.SUCCESSFUL); // Use enum
        payment.setPaymentTime(LocalDateTime.now()); // Use correct method
        paymentRepository.save(payment);

        booking.setPaymentStatus("CONFIRMED");
        bookingRepository.save(booking);
    }
}