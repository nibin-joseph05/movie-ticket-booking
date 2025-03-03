package com.movieticketbooking.movieflix.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String emailUsername;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            String emailContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>"
                    + "<h2 style='color: #333; text-align: center;'>Your OTP Code</h2>"
                    + "<p style='font-size: 16px; color: #555;'>Hello,</p>"
                    + "<p style='font-size: 16px; color: #555;'>Your OTP for login is:</p>"
                    + "<div style='font-size: 22px; font-weight: bold; text-align: center; padding: 10px; background: #f8f8f8; border-radius: 5px; width: fit-content; margin: auto;'>"
                    + otp + "</div>"
                    + "<p style='font-size: 14px; color: #777;'>This OTP is valid for 5 minutes. Do not share it with anyone.</p>"
                    + "<p style='font-size: 14px; color: #777;'>If you did not request this OTP, please ignore this email.</p>"
                    + "<hr style='border: none; border-top: 1px solid #ddd;'>"
                    + "<p style='font-size: 12px; color: #888; text-align: center;'>MovieFlix | Secure Login System</p>"
                    + "</div>";

            helper.setFrom(new InternetAddress(emailUsername, "MovieFlix Support"));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}
