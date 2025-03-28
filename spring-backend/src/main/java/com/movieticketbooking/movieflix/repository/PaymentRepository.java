package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
}