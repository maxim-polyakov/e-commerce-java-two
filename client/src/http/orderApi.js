import {$authhost} from "./index";

export const getUserOrders = async () => {
    try {
        const { data } = await $authhost.get('/order');
        return data;
    } catch (error) {
        console.log("Get user orders error:", error);

        let errorMessage = "Ошибка получения списка заказов";

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
                errorMessage = "Заказы не найдены";
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

export const createOrder = async (orderData) => {
    try {
        console.log('orderData', orderData);
        const { data } = await $authhost.post('/order/create', orderData);
        return data;
    } catch (error) {
        console.log("Create order error:", error);

        let errorMessage = "Ошибка создания заказа";

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
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверные данные заказа";
            }
            else if (error.response.status === 422) {
                errorMessage = error.response.data?.message || "Ошибка валидации данных";
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