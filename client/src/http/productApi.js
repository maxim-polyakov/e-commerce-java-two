import { $authhost } from ".";
/**
 * Получает список продуктов с сервера с авторизацией
 * @returns {Promise<Array>} Массив объектов продуктов
 */
export const getProducts = async () => {
    try {
        const response = await $authhost.get('/product');

        // Данные должны соответствовать вашей структуре JSON
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error.message);
        throw error;
    }
};