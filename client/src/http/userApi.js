import { $host, $authhost } from ".";
import { jwtDecode } from "jwt-decode";

export const registration = async (email, password) => {
    try {
        const { data } = await $host.post("api/user/registration", {
            email,
            password,
        });
        localStorage.setItem("token", data.token);
        return jwtDecode(data.token);
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

export const login = async (email, password) => {
    try {
        const { data } = await $host.post("api/user/login", {
            email,
            password,
        });
        localStorage.setItem("token", data.token);
        return jwtDecode(data.token);
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
