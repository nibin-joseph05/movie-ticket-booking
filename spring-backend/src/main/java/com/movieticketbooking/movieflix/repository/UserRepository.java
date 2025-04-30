package com.movieticketbooking.movieflix.repository;

import com.movieticketbooking.movieflix.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);

    // UserRepository.java
    @Query(value = "SELECT * FROM users WHERE " +
            "LOWER(first_name) LIKE LOWER(:searchTerm) OR " +
            "LOWER(last_name) LIKE LOWER(:searchTerm) OR " +
            "LOWER(email) LIKE LOWER(:searchTerm) OR " +
            "phone_number LIKE :searchTerm " +
            "LIMIT :limit OFFSET :offset",
            nativeQuery = true)
    List<User> findFilteredUsers(@Param("searchTerm") String searchTerm,
                                 @Param("limit") int limit,
                                 @Param("offset") int offset);

    @Query(value = "SELECT COUNT(*) FROM users WHERE " +
            "LOWER(first_name) LIKE LOWER(:searchTerm) OR " +
            "LOWER(last_name) LIKE LOWER(:searchTerm) OR " +
            "LOWER(email) LIKE LOWER(:searchTerm) OR " +
            "phone_number LIKE :searchTerm",
            nativeQuery = true)
    long countFilteredUsers(@Param("searchTerm") String searchTerm);

    @Query(value = "SELECT * FROM users LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<User> findAllUsers(@Param("limit") int limit, @Param("offset") int offset);
}
