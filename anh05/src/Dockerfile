# Bước 1: Build file jar
FROM maven:3.9.5-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng
FROM eclipse-temurin:21-jre-jammy
# Thiết lập thư mục làm việc là /app
WORKDIR /app

# Copy file jar từ bước build vào /app/app.jar
COPY --from=build /target/*.jar app.jar

# COPY thư mục images từ Git vào /app/images
COPY images /app/images

EXPOSE 8080

# Chạy app (Docker sẽ tìm thấy folder images nằm ngay cạnh file jar)
ENTRYPOINT ["java", "-jar", "app.jar"]