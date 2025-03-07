package com.movieticketbooking.movieflix.service;

import com.movieticketbooking.movieflix.models.Admin;
import com.movieticketbooking.movieflix.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    public Admin registerAdmin(Admin admin) {

        admin.setPassword(encoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }


    public boolean authenticateAdmin(String email, String rawPassword) {
        Optional<Admin> adminOptional = adminRepository.findByEmail(email);

        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            return encoder.matches(rawPassword, admin.getPassword());
        }
        return false;
    }
}
