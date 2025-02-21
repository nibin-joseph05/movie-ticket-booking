package com.moviebooking.movieticketbooking.service;


import com.moviebooking.movieticketbooking.entity.User;
import com.moviebooking.movieticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    public Optional<User> findUserByEmail(String email){
        return userRepository.findByEmail(email);
    }
    public Optional<User> findUserByGoogleId(String googleId){
        return userRepository.findByGoogleId(googleId);
    }
    public User saveUser(User user){
        return userRepository.save(user);
    }
}
