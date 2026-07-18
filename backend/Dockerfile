# --- STAGE 1: Build the Spring Boot Application ---
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and the entire source code
COPY pom.xml .
COPY src ./src

# Compile and package the application into a JAR file, skipping tests for faster build
RUN mvn clean package -DskipTests

# --- STAGE 2: Lightweight Runtime ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects the PORT environment variable dynamically (defaults to 10000 or 8080)
EXPOSE 8080

# Execute the application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
