# Стадия сборки
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Финальная стадия
FROM alpine:3.20
RUN apk add --no-cache openjdk17-jdk bash

WORKDIR /app

# Копируем JAR из стадии сборки
COPY --from=builder /app/target/*.jar app.jar

# ПРАВИЛЬНЫЙ ПОРЯДОК:
# 1. Создаем пользователя
RUN addgroup -S spring && adduser -S spring -G spring

# 2. Создаем директорию
RUN mkdir -p /app/uploads/images

# 3. Даем права пользователю spring
RUN chown -R spring:spring /app && \
    chmod -R 755 /app/uploads

# 4. Переключаемся на пользователя spring
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]