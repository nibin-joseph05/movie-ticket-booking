# --- Stage 1: Build the application ---
# Use a JDK image with Maven for building
FROM openjdk:21-jdk-slim AS build

# Set the working directory inside this build stage
WORKDIR /app

# Copy the Maven wrapper files (mvnw, .mvn folder) and pom.xml first
# This allows Docker to cache these layers, speeding up builds if only source code changes
COPY mvnw .
COPY .mvn .mvn/
COPY pom.xml .

# Download dependencies (this step will be cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline

# Copy the rest of the source code
COPY src ./src/

# Build the Spring Boot application (creates the JAR in target/)
# We skip tests here to speed up the build for deployment
RUN ./mvnw clean install -DskipTests

# --- Stage 2: Create the final runtime image ---
# Use a smaller JRE-only image for the final application, as it's lighter
FROM openjdk:21-jre-headless

# Set the working directory for the final image
WORKDIR /app

# Copy the built JAR file from the 'build' stage into the final image
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app listens on (default for Spring Boot is 8080)
EXPOSE 8080

# Command to run your Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]