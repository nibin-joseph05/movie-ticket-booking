package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
}