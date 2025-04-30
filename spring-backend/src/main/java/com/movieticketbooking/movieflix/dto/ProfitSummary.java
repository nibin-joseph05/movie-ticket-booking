package com.movieticketbooking.movieflix.dto;

import java.util.List;

public record ProfitSummary(
        double totalTicketSales,
        double totalFoodSales,
        double totalProfit,
        List<MonthlyProfit> monthlyTrend
) {}