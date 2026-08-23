# Multi-stage Dockerfile for Spring Boot Application (Repo Root)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy server files
COPY server/pom.xml .
COPY server/src ./src

# Build the application JAR package
RUN mvn clean package -DskipTests

# Runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
