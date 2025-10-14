# Стадия сборки
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Собираем приложение и пропускаем тесты для ускорения
RUN mvn clean package -DskipTests

# Финальная стадия
FROM openjdk:17-jdk-alpine
WORKDIR /app

# Копируем JAR из стадии сборки
COPY --from=builder /app/target/*.jar app.jar

# Создаем непривилегированного пользователя
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]