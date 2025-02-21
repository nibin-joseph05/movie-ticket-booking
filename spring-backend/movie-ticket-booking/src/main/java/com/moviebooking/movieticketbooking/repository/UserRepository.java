package com.moviebooking.movieticketbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.moviebooking.movieticketbooking.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);
}
