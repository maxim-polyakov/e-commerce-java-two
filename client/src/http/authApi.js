import { $host, $authhost } from ".";
import { jwtDecode } from "jwt-decode";

export const registration = async (email, username, firstName, lastName, password) => {
    try {
        const response = await $host.post("/auth/register", {
            email,
            username,
            firstName,
            lastName,
            password,
        });

        // Если статус 200, возвращаем текстовое сообщение
        if (response.status === 200) {
            return "Письмо с подтверждением отправлено на вашу электронную почту";
        }

        return response.data;

    } catch (error) {
        console.log("Registration error:", error);

        let errorMessage = "Ошибка регистрации";

        if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
            const errorMatch = error.response.data.match(/Error: (.+?)(<br>|\n|$)/);
            if (errorMatch && errorMatch[1]) {
                errorMessage = errorMatch[1].trim();
            }
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const login = async (usernameoremail, password) => {
    try {
        const { data } = await $host.post("/auth/login", {
            usernameoremail,
            password,
        });
        localStorage.setItem("token", data.jwt);
        return jwtDecode(data.jwt);
    } catch (error) {
        console.log("Login error:", error);

        let errorMessage = "Ошибка авторизации";

        // Обработка ошибок БИЗНЕС-ЛОГИКИ (сервер ответил с ошибкой)
        if (error.response) {
            // Сервер ответил, но с ошибкой (4xx, 5xx)
            if (error.response.status === 404) {
                // Это может быть как "Пользователь не найден", так и ошибка маршрута
                // Проверяем, есть ли в ответе сообщение об ошибке
                if (error.response.data?.message) {
                    errorMessage = error.response.data.message; // "Пользователь не найден"
                } else if (typeof error.response.data === 'string') {
                    // Пытаемся извлечь сообщение из HTML/текста
                    const match = error.response.data.match(/Пользователь не найден|User not found/i);
                    errorMessage = match ? match[0] : "Ресурс не найден";
                } else {
                    errorMessage = "Пользователь не найден";
                }
            }
            else if (error.response.status === 401) {
                errorMessage = "Неверный email или пароль";
            }
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверные данные";
            }
            else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        }
        // Обработка ошибок ПОДКЛЮЧЕНИЯ (сервер не ответил)
        else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
            errorMessage = "Не удалось подключиться к серверу";
        }
        // Обработка других ошибок
        else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const check = async () => {
    try {
        // Проверяем наличие токена в localStorage перед запросом
        const token = localStorage.getItem("token");
        if (!token) {
            // Не выбрасываем ошибку, просто возвращаем null или false
            return null;
        }

        const { data } = await $authhost.get("/auth/check");

        // Обновляем токен, если сервер вернул новый
        if (data.jwt) {
            localStorage.setItem("token", data.jwt);
        }

        return jwtDecode(data.jwt);
    } catch (error) {
        console.log("Ошибка проверки авторизации:", error);

        // Очищаем токен при ошибке авторизации
        localStorage.removeItem("token");

        // Не выбрасываем ошибку, просто возвращаем null
        return null;
    }
};

export const verifyEmail = async (token) => {
    try {
        console.log("Verifying email with token:", token);
        const { data } = await $host.post(`/auth/verify?token=${token}`);

        console.log("Email verification successful:", data);
        return data;
    } catch (error) {
        console.log("Email verification error:", error);

        let errorMessage = "Ошибка верификации email";

        if (error.response) {
            if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверный или просроченный токен";
            }
            else if (error.response.status === 404) {
                errorMessage = error.response.data?.message || "Пользователь не найден";
            }
            else if (error.response.status === 410) {
                errorMessage = error.response.data?.message || "Ссылка для подтверждения устарела";
            }
            else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        }
        else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
            errorMessage = "Не удалось подключиться к серверу";
        }
        else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const sendPasswordResetEmail = async (email) => {
    try {
        console.log("Sending password reset email to:", email);
        const { data } = await $host.post(`/auth/forgot?email=${email}`);

        console.log("Password reset email sent successfully:", data);
        return data;
    } catch (error) {
        console.log("Password reset error:", error);

        let errorMessage = "Ошибка при отправке письма";

        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = "Пользователь с таким email не найден";
            }
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверный email адрес";
            }
            else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        }
        else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
            errorMessage = "Не удалось подключиться к серверу";
        }
        else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const resetPassword = async (token, password) => {
    try {
        const { data } = await $host.post("/auth/reset", {
            token,
            password
        });

        console.log("Password reset successful:", data);
        return data;
    } catch (error) {
        console.log("Password reset error:", error);

        let errorMessage = "Ошибка при смене пароля";

        if (error.response) {
            if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверный или просроченный токен";
            }
            else if (error.response.status === 404) {
                errorMessage = "Пользователь не найден";
            }
            else if (error.response.status === 410) {
                errorMessage = "Ссылка для сброса пароля устарела";
            }
            else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        }
        else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
            errorMessage = "Не удалось подключиться к серверу";
        }
        else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const getCurrentUser = async () => {
    try {
        const { data } = await $authhost.get('/auth/me');
        return data;
    } catch (error) {
        console.log("Get current user error:", error);

        let errorMessage = "Ошибка получения данных пользователя";

        // Обработка ошибок БИЗНЕС-ЛОГИКИ (сервер ответил с ошибкой)
        if (error.response) {
            // Сервер ответил, но с ошибкой (4xx, 5xx)
            if (error.response.status === 401) {
                errorMessage = "Требуется авторизация";
                // Очищаем токен при ошибке авторизации
                localStorage.removeItem("token");
            }
            else if (error.response.status === 403) {
                errorMessage = "Доступ запрещен";
            }
            else if (error.response.status === 404) {
                errorMessage = "Пользователь не найден";
            }
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверный запрос";
            }
            else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
            else if (typeof error.response.data === 'string') {
                // Пытаемся извлечь сообщение из HTML/текста
                const match = error.response.data.match(/Error: (.+?)(<br>|\n|$)/);
                if (match && match[1]) {
                    errorMessage = match[1].trim();
                }
            }
        }
        // Обработка ошибок ПОДКЛЮЧЕНИЯ (сервер не ответил)
        else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
            errorMessage = "Не удалось подключиться к серверу";
        }
        // Обработка других ошибок
        else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};
