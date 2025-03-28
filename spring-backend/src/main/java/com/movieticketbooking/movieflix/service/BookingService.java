//package com.movieticketbooking.movieflix.service;
//
//import com.movieticketbooking.movieflix.models.*;
//import com.movieticketbooking.movieflix.repository.*;
//import jakarta.transaction.Transactional;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.time.LocalDate;  // Add this import
//import java.time.LocalDateTime;
//
//
//@Service
//public class BookingService {
//
//    @Autowired
//    private BookingRepository bookingRepository;
//
//    @Autowired
//    private BookedSeatRepository bookedSeatRepository;
//
//    @Autowired
//    private FoodOrderRepository foodOrderRepository;
//
//    @Autowired
//    private ShowtimeRepository showtimeRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private FoodItemRepository foodItemRepository;
//
//    @Transactional
//    public Booking createBooking(Long movieId, String theaterId, LocalDate date, String time,
//                                 String userEmail, List<String> seatNumbers,
//                                 BookedSeat.SeatCategory seatCategory, List<FoodOrderRequest> foodOrders) {
//
//        // Validate and fetch required entities
//        Showtime showtime = showtimeRepository.findByMovieIdAndTheatreIdAndDateAndTime(
//                        movieId, theaterId, date, time)
//                .orElseThrow(() -> new RuntimeException("Showtime not found"));
//
//        User user = userRepository.findByEmail(userEmail)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        // Create booking
//        Booking booking = new Booking();
//        booking.setUser(user);
//        booking.setShowtime(showtime);
//        booking.setBookingTime(LocalDateTime.now());
//        booking.setPaymentStatus("PENDING");
//
//        // Save booking first to generate ID
//        booking = bookingRepository.save(booking);
//
//        // Add seats
//        for (String seatNumber : seatNumbers) {
//            BookedSeat seat = new BookedSeat();
//            seat.setBooking(booking);
//            seat.setSeatNumber(seatNumber);
//            seat.setCategory(seatCategory);
//            seat.setPrice(getSeatPrice(seatCategory, showtime));
//            bookedSeatRepository.save(seat);
//            booking.addSeat(seat);
//        }
//
//        // Add food orders
//        for (FoodOrderRequest foodOrderReq : foodOrders) {
//            FoodItem foodItem = foodItemRepository.findById(foodOrderReq.getFoodItemId())
//                    .orElseThrow(() -> new RuntimeException("Food item not found"));
//
//            FoodOrder foodOrder = new FoodOrder();
//            foodOrder.setBooking(booking);
//            foodOrder.setFoodItem(foodItem);
//            foodOrder.setQuantity(foodOrderReq.getQuantity());
//            foodOrder.setPriceAtOrder(foodItem.getPrice());
//            foodOrderRepository.save(foodOrder);
//            booking.addFoodOrder(foodOrder);
//        }
//
//        // Calculate and set total amount
//        booking.setTotalAmount(booking.calculateTotalAmount());
//
//        return bookingRepository.save(booking);
//    }
//
//    private double getSeatPrice(BookedSeat.SeatCategory category, Showtime showtime) {
//        switch (category) {
//            case SILVER: return showtime.getSilverPrice();
//            case GOLD: return showtime.getGoldPrice();
//            case PLATINUM: return showtime.getPlatinumPrice();
//            default: throw new IllegalArgumentException("Invalid seat category");
//        }
//    }
//
//    // DTO for food order request
//    public static class FoodOrderRequest {
//        private Long foodItemId;
//        private Integer quantity;
//
//        public Long getFoodItemId() { return foodItemId; }
//        public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }
//        public Integer getQuantity() { return quantity; }
//        public void setQuantity(Integer quantity) { this.quantity = quantity; }
//    }
//}