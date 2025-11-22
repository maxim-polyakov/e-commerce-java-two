# Стадия сборки
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Финальная стадия
FROM alpine:3.20
RUN apk add --no-cache openjdk17-jdk bash su-exec

WORKDIR /app

# Копируем JAR из стадии сборки
COPY --from=builder /app/target/*.jar app.jar

# Создаем пользователя spring с UID 1000
RUN addgroup -g 1000 spring && \
    adduser -D -u 1000 -G spring spring && \
    chown spring:spring /app

EXPOSE 8080

# Entrypoint будет переопределен в docker-compose
ENTRYPOINT ["java", "-jar", "app.jar"]