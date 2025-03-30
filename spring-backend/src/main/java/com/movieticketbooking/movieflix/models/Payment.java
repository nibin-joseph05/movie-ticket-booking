package com.movieticketbooking.movieflix.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    private Booking booking;

    @Column(nullable = false)
    private String transactionId;
    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Column(nullable = false)
    private LocalDateTime paymentTime;

    private String receiptNumber;

    // Payment status enum
    public enum PaymentStatus {
        PENDING, SUCCESSFUL, FAILED, REFUNDED, PARTIALLY_REFUNDED
    }

    // Payment method enum
    public enum PaymentMethod {
        RAZORPAY, CREDIT_CARD, DEBIT_CARD, UPI, NETBANKING, WALLET, CASH
    }

    // Constructors
    public Payment() {
        this.paymentTime = LocalDateTime.now();
        this.status = PaymentStatus.PENDING;
    }

    public Payment(Booking booking, double amount) {
        this();
        this.booking = booking;
        this.amount = amount;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Booking getBooking() { return booking; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    public PaymentMethod getMethod() { return method; }
    public void setMethod(PaymentMethod method) { this.method = method; }
    public LocalDateTime getPaymentTime() { return paymentTime; }
    public void setPaymentTime(LocalDateTime paymentTime) { this.paymentTime = paymentTime; }
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
}

