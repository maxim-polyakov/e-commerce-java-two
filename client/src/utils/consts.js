export const LOGIN_ROUTE = "/auth/login";
export const REGISTRATION_ROUTE = "/auth/registration";
export const SEND_MAIL = "/auth/send";
export const VERIFY_EMAIL_ROUTE = '/auth/verify';
export const FORGOT_PASSWORD_ROUTE = '/auth/forgot-password';
export const RESET_PASSWORD_ROUTE = '/auth/reset';
export const ECOMMERCE_ROUTE = '/shop';
export const CHECKOUT_ROUTE = '/checkout';
export const PAYMENT_SUCCESS_ROUTE = '/payment/success';
export const PRODUCT_ROUTE = '/product'; // Базовый путь для товаров
export const BASE_URL = window.location.origin;

// Функция для генерации пути к конкретному товару
export const getProductRoute = (productId) => `${PRODUCT_ROUTE}/${productId}`;