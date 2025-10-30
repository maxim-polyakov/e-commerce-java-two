import { $authhost } from ".";

export const getProducts = async (page = 0, size = 10) => {
    // Этот метод остается без изменений
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
        // ... обработка ошибок (без изменений)
    }
};

export const createProduct = async (formData) => {
    try {
        console.log('Sending multipart form data:', formData);

        const { data } = await $authhost.post('/product', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

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
            else if (error.response.status === 415) {
                errorMessage = "Неверный формат данных. Пожалуйста, попробуйте снова.";
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