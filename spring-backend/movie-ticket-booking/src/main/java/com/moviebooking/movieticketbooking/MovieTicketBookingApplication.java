package com.moviebooking.movieticketbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
// @ComponentScan(basePackages = "com.moviebooking.movieticketbooking")
public class MovieTicketBookingApplication {
	public static void main(String[] args) {
		SpringApplication.run(MovieTicketBookingApplication.class, args);
	}
}