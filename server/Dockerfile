# Стадия сборки
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Собираем приложение и пропускаем тесты для ускорения
RUN mvn clean package -DskipTests

# Финальная стадия
FROM eclipse-temurin:17

# Создаем директорию для загрузок
RUN mkdir -p /app/uploads/images && chmod 755 /app/uploads/images

WORKDIR /app

# Копируем JAR из стадии сборки
COPY --from=builder /app/target/*.jar app.jar

# Создаем непривилегированного пользователя
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]