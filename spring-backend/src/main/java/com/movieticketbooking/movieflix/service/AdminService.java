package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.dto.BookingDetailsDTO;
import com.movieticketbooking.movieflix.dto.BookingListDTO;
import com.movieticketbooking.movieflix.dto.MonthlyProfit;
import com.movieticketbooking.movieflix.dto.ProfitSummary;
import com.movieticketbooking.movieflix.models.Admin;
import com.movieticketbooking.movieflix.models.Booking;
import com.movieticketbooking.movieflix.models.User;
import com.movieticketbooking.movieflix.repository.AdminRepository;
import com.movieticketbooking.movieflix.repository.BookingRepository;
import com.movieticketbooking.movieflix.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    public Admin registerAdmin(Admin admin) {

        admin.setPassword(encoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }


    public boolean authenticateAdmin(String email, String rawPassword) {
        Optional<Admin> adminOptional = adminRepository.findByEmail(email);

        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            return encoder.matches(rawPassword, admin.getPassword());
        }
        return false;
    }

    public List<User> getFilteredUsers(String search, int limit, int offset) {
        if (search != null && !search.isEmpty()) {
            String searchTerm = "%" + search.toLowerCase() + "%";
            return userRepository.findFilteredUsers(searchTerm, limit, offset);
        }
        return userRepository.findAllUsers(limit, offset);
    }

    public long countFilteredUsers(String search) {
        if (search != null && !search.isEmpty()) {
            String searchTerm = "%" + search.toLowerCase() + "%";
            return userRepository.countFilteredUsers(searchTerm);
        }
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public Page<BookingListDTO> getBookingList(String search, int page, int size) {
        Page<Booking> bookings = bookingRepository.findBasicBookings(
                "%" + search.toLowerCase() + "%",
                PageRequest.of(page, size)
        );
        return bookings.map(BookingListDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public Optional<BookingDetailsDTO> getBookingDetails(String reference) {
        Optional<Booking> booking = bookingRepository.findDetailedBooking(reference);
        booking.ifPresent(b -> {
            bookingRepository.findWithFoodOrders(reference)
                    .ifPresent(fb -> b.setFoodOrders(fb.getFoodOrders()));
        });
        return booking.map(BookingDetailsDTO::fromEntity);
    }

    public ProfitSummary getProfitSummary(LocalDateTime start, LocalDateTime end) {
        Double ticketSales = bookingRepository.sumTicketSalesByDateRange(start, end);
        Double foodSales = bookingRepository.sumFoodSalesByDateRange(start, end);
        List<MonthlyProfit> trend = bookingRepository.getMonthlyProfitTrend();

        return new ProfitSummary(
                ticketSales != null ? ticketSales : 0.0,
                foodSales != null ? foodSales : 0.0,
                (ticketSales != null ? ticketSales : 0.0) + (foodSales != null ? foodSales : 0.0),
                trend
        );
    }



}
