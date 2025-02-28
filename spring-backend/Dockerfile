# Use OpenJDK as base image
FROM openjdk:21-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the built jar file into the container
COPY target/*.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
