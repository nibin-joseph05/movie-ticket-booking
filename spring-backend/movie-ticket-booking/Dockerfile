# Use the OpenJDK 21 image as the base image
FROM openjdk:21-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built jar file to the container
COPY target/movie-ticket-booking-0.0.1-SNAPSHOT.jar /app/movie-ticket-booking.jar

# Expose the port the app will run on
EXPOSE 8080

# Run the Spring Boot application
CMD ["java", "-jar", "movie-ticket-booking.jar"]
