package com.movieticketbooking.movieflix;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan
public class MovieflixApplication {

	@Bean
	public Dotenv dotenv() {
		return Dotenv.configure().ignoreIfMissing().load();
	}
	public static void main(String[] args) {
		SpringApplication.run(MovieflixApplication.class, args);
	}

}
