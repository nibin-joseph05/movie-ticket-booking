package com.moviebooking.movieticketbooking.controller;


import com.moviebooking.movieticketbooking.entity.User;
import com.moviebooking.movieticketbooking.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/auth")
@CrossOrigin(origins = "http:localhost:3000", allowCredentials = "true")
public class userController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public String registerUser(@RequestBody User user, HttpSession session){
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if(existingUser.isPresent()){
            return "Email already Registered!";
        }
        User savedUser = userRepository.save(user);
        session.setAttribute("user", savedUser);

        return "User Registered Successfully !";
    }

    @GetMapping("/session-user")
    public User getSessionUser(HttpSession session){
        return (User) session.getAttribute("user");
    }

    public String logout(HttpSession session){
        session.invalidate();
        return "Logged Out Successfully";
    }


}
