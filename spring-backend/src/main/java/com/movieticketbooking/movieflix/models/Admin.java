package com.movieticketbooking.movieflix.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Entity
@Table(name = "admin")
public class Admin {

    public Admin() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int adminId;

    @NotNull
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotNull
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Column(nullable = false)
    private String password;


    public int getAdminId() {
        return adminId;
    }

    public void setAdminId(int adminId) {
        this.adminId = adminId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }


    public void setPassword(String password) {
        this.password = password;
    }

}
