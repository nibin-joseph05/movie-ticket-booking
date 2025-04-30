package com.movieticketbooking.movieflix.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.activation.DataSource;
import jakarta.mail.util.ByteArrayDataSource;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;



@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String emailUsername;

    @Value("${app.base.url}")
    private String baseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String otp, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            String actionDescription = "";
            if ("PHONE_UPDATE".equals(purpose)) {
                actionDescription = "phone number change";
            } else {
                actionDescription = "login";
            }

            String emailContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>"
                    + "<div style='text-align: center;'>"
                    + "<img src='https://imgur.com/MXX25b3.png' style='max-width: 150px; margin-bottom: 20px;'/>"
                    + "</div>"
                    + "<h2 style='color: #333; text-align: center;'>Your Verification Code</h2>"
                    + "<p style='font-size: 16px; color: #555;'>Hello,</p>"
                    + "<p style='font-size: 16px; color: #555;'>Your verification code for " + actionDescription + " is:</p>"
                    + "<div style='font-size: 22px; font-weight: bold; text-align: center; padding: 10px; background: #f8f8f8; border-radius: 5px; width: fit-content; margin: auto;'>"
                    + otp + "</div>"
                    + "<p style='font-size: 14px; color: #777;'>This code is valid for 5 minutes. Do not share it with anyone.</p>"
                    + "<p style='font-size: 14px; color: #777;'>If you did not request this change, please contact support immediately.</p>"
                    + "<hr style='border: none; border-top: 1px solid #ddd;'>"
                    + "<p style='font-size: 12px; color: #888; text-align: center;'>MovieFlix | Account Security</p>"
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

    public void sendTicketEmail(String to, String subject, String content, byte[] ticketPdf) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            String emailContent = "<!DOCTYPE html>"
                    + "<html>"
                    + "<head>"
                    + "<style>"
                    + "  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; }"
                    + "  .header { background-color: #e50914; padding: 20px; text-align: center; }"
                    + "  .header img { max-width: 150px; }"
                    + "  .content { padding: 20px; background-color: #f9f9f9; }"
                    + "  .ticket-info { background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }"
                    + "  h1 { color: #e50914; text-align: center; }"
                    + "  .qr-code { text-align: center; margin: 20px 0; }"
                    + "  .footer { background-color: #141414; color: white; padding: 15px; text-align: center; font-size: 12px; }"
                    + "  .button { background-color: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }"
                    + "</style>"
                    + "</head>"
                    + "<body>"
                    + "<div class='header'>"
                    + "<img src='https://i.imgur.com/MXX25b3.png' alt='MovieFlix Logo'>"
                    + "</div>"
                    + "<div class='content'>"
                    + "<h1>Your Movie Ticket</h1>"
                    + "<div class='ticket-info'>"
                    + content
                    + "<div class='qr-code'>"
                    + "<p>Present this QR code at the theater:</p>"
                    + "<img src='cid:qrCode' width='150' alt='QR Code'>"
                    + "</div>"
                    + "</div>"
                    + "</div>"
                    + "<div class='footer'>"
                    + "<p>MovieFlix | Enjoy Your Movie Experience</p>"
                    + "<p>Need help? Contact us at support@movieflex.com</p>"
                    + "</div>"
                    + "</body>"
                    + "</html>";

            helper.setFrom(new InternetAddress(emailUsername, "MovieFlix Tickets"));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(emailContent, true);

            // Attach PDF ticket
            DataSource dataSource = new ByteArrayDataSource(ticketPdf, "application/pdf");
            helper.addAttachment("MovieTicket.pdf", dataSource);

            // Add QR code as inline image
            String qrCodeUrl = baseUrl + "/verify-ticket?ref=" + subject.split("#")[1]; // Extract ref from subject
            java.net.URL qrUrl = new java.net.URL("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + qrCodeUrl);
            helper.addInline("qrCode", new UrlResource(qrUrl));

            mailSender.send(message);
            System.out.println("Ticket email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Error sending ticket email: " + e.getMessage());
            throw new RuntimeException("Failed to send ticket email", e);
        }
    }


}
