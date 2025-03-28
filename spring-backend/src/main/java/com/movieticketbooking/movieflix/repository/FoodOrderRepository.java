package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {
}