package com.movieticketbooking.movieflix.dto;

public record MonthlyProfit(
        String month,  // Format: "YYYY-MM"
        double ticketSales,
        double foodSales
) {}
