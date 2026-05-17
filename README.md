# E-Commerce (Java + React)

Интернет-магазин с REST API на Spring Boot и SPA на React. Поддерживаются регистрация по email, вход через Google, корзина, заказы, оплата и доставка.

## Возможности

- **Каталог** — витрина, список товаров, карточка товара, описания
- **Авторизация** — регистрация, вход по логину/паролю, подтверждение email, сброс пароля
- **Google OAuth** — вход и автоматическая регистрация без пароля, аватар из Google-аккаунта
- **Профиль** — данные пользователя, адреса доставки
- **Заказы** — оформление, история заказов
- **Оплата** — YooKassa
- **Доставка** — интеграция с API Яндекс Доставки
- **Хранилище** — загрузка изображений в Yandex Object Storage (S3-совместимое)
- **Реклама** — блок Яндекс РСЯ (RTB) на странице магазина
- **API** — Swagger UI (`/api-docs`)

## Стек технологий

| Слой | Технологии |
|------|------------|
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data JPA, OAuth2 Client, JWT |
| Frontend | React 19, React Router, MobX, Axios, React Bootstrap |
| БД | PostgreSQL |
| Прочее | Docker, MailDev (SMTP в dev), WebSocket |

## Структура репозитория

```
e-commerce-java-two/
├── client/                 # React SPA
│   ├── public/             # index.html, статика, загрузчик РСЯ
│   └── src/
│       ├── components/     # UI-компоненты (корзина, профиль, реклама…)
│       ├── http/             # API-клиенты
│       └── pages/            # Страницы (Auth, Ecommerce, Checkout…)
├── server/                 # Spring Boot API
│   └── src/main/java/com/ecommercebackend/
│       ├── api/              # REST-контроллеры, security
│       ├── config/           # OAuth2, S3, загрузки
│       ├── model/            # JPA-сущности
│       └── service/          # Бизнес-логика
├── docker-compose.yml
├── GOOGLE_OAUTH_SETUP.md     # Настройка Google OAuth
└── README.md
```

## Требования

- **JDK 17+** и **Maven 3.9+** (для backend)
- **Node.js 18+** и **npm** (для frontend)
- **PostgreSQL** (или строка подключения к облачной БД)
- **Docker** и **Docker Compose** (опционально)

## Быстрый старт (локально)

### 1. Backend

```bash
cd server
```

Настройте `src/main/resources/application.properties` (БД, JWT, интеграции). Минимально нужны:

- `spring.datasource.*` — PostgreSQL
- `jwt.algorithm.key`, `jwt.issuer`, `jwt.expiryInSeconds`
- `app.frontend.url` — URL фронтенда (для редиректа после Google OAuth)

Запуск:

```bash
./mvnw spring-boot:run
```

API по умолчанию: `http://localhost:8080`  
Swagger: `http://localhost:8080/api-docs`

### 2. Frontend

```bash
cd client
npm install
```

Создайте `client/.env`:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_S3_URL=https://storage.yandexcloud.net/ВАШ_БАКЕТ
```

Запуск:

```bash
npm start
```

Приложение: `http://localhost:3000`

## Docker Compose

Из корня проекта:

```bash
docker compose up --build
```

| Сервис | Порт (хост) | Описание |
|--------|-------------|----------|
| `client` | 3056 → 3000 | React (production build + serve) |
| `app` | 5654 → 8080 | Spring Boot API |
| `smtp-service` | 8180 | MailDev (веб-интерфейс почты) |

Перед запуском задайте переменные в `client/.env` и при необходимости `server/.env` (SMTP и т.д.).

## Переменные окружения

### Frontend (`client/.env`)

| Переменная | Описание |
|------------|----------|
| `REACT_APP_API_URL` | Базовый URL backend API |
| `REACT_APP_S3_URL` | Публичный URL бакета для картинок товаров |

### Backend (`server/src/main/resources/application.properties`)

Основные группы настроек (подставьте свои значения, **не коммитьте секреты** в публичный репозиторий):

- **БД:** `spring.datasource.url`, `username`, `password`
- **JWT:** `jwt.algorithm.key`, `jwt.issuer`, `jwt.expiryInSeconds`
- **Приложение:** `app.frontend.url`, `app.upload.dir`
- **Google OAuth:** `spring.security.oauth2.client.registration.google.client-id`, `client-secret`, `scope`
- **YooKassa:** `yookassa.shop.id`, `yookassa.secret.key`
- **Yandex Storage:** `yandex.storage.access-key`, `secret-key`, `bucket-name`
- **Yandex Delivery:** `yandex.delivery.api.token`, `url`, `platform_id`
- **Почта:** `email.from`, `spring.mail.*`

За reverse proxy (nginx) добавьте:

```properties
server.forward-headers-strategy=framework
```

## Google OAuth

Вход через Google: редирект на `{API_URL}/oauth2/authorization/google` → callback → обмен code на JWT на фронте.

Подробная настройка Client ID, redirect URI и свойств Spring — в [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md).

**Redirect URI в Google Console:**

- `https://ВАШ_API_ДОМЕН/login/oauth2/code/google`
- `http://localhost:8080/login/oauth2/code/google` (локально)

## Реклама (Яндекс РСЯ)

- Загрузчик `context.js` подключён в `client/public/index.html` (в `<head>`).
- Блок `R-A-19265736-1` выводится компонентом `YandexRtbBanner` на странице магазина (`/shop`).

Чтобы сменить блок, отредактируйте `client/src/components/YandexRtbBanner.js` и при необходимости `index.html`.

## Основные маршруты API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход (JWT) |
| GET | `/auth/oauth-token?code=` | Обмен OAuth code на JWT (после Google) |
| GET | `/auth/me` | Текущий пользователь |
| GET | `/auth/check` | Проверка сессии / обновление JWT |
| GET | `/oauth2/authorization/google` | Старт входа через Google |
| GET | `/product` | Список товаров |

Полный список — в Swagger UI.

## Продакшен

- Frontend: `https://ecommerce.baxic.ru` (пример)
- API: `https://ecommerceapi.baxic.ru` (пример)
- Nginx проксирует HTTPS на backend и передаёт заголовки `X-Forwarded-Proto`, `X-Forwarded-Host`
- В Google Console и РСЯ укажите те же домены, что используются в проде

## Тесты (backend)

```bash
cd server
./mvnw test
```

Тесты используют H2 и отдельный `src/test/resources/config/application.properties`.

## Лицензия

Проект учебный / частный. Уточните лицензию у владельца репозитория при публикации.
