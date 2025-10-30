import { $authhost } from ".";

export const getProducts = async (page = 0, size = 10) => {
    try {
        const { data } = await $authhost.get('/product', {
            params: {
                page,
                size
            }
        });
        console.log(data);
        return data;
    } catch (error) {
        console.log("Get products error:", error);

        let errorMessage = "Ошибка получения списка продуктов";

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
                errorMessage = "Продукты не найдены";
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

export const createProduct = async (productData) => {
    try {
        console.log(productData);
        const { data } = await $authhost.post('/product', productData);
        console.log("Product created successfully:", data);
        return data;
    } catch (error) {
        console.log("Create product error:", error);

        let errorMessage = "Ошибка создания продукта";

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
                errorMessage = error.response.data?.message || "Неверные данные продукта";
            }
            else if (error.response.status === 409) {
                errorMessage = "Продукт с таким именем уже существует";
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

export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Убираем префикс "data:image/png;base64," если нужно только base64
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};