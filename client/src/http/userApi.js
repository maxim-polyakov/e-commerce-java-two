import { $authhost } from ".";

export const addUserAddress = async (userId, addressData) => {
    try {
        console.log("Adding address for user:", userId, addressData);
        const { data } = await $authhost.put(`/user/${userId}/address`, addressData);

        console.log("Address added successfully:", data);
        return data;
    } catch (error) {
        console.log("Add address error:", error);

        let errorMessage = "Ошибка при добавлении адреса";

        if (error.response) {
            if (error.response.status === 403) {
                errorMessage = "Доступ запрещен. Проверьте авторизацию";
            }
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверные данные адреса";
            }
            else if (error.response.status === 404) {
                errorMessage = "Пользователь не найден";
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

export const getUserAddresses = async (userId) => {
    try {
        const { data } = await $authhost.get(`/user/${userId}/address`);
        return data;
    } catch (error) {
        let errorMessage = "Ошибка при получении адреса";
        if (error.response) {
            if (error.response.status === 403) {
                errorMessage = "Доступ запрещен. Проверьте авторизацию";
            }
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверные данные адреса";
            }
            else if (error.response.status === 404) {
                errorMessage = "Пользователь не найден";
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

export const updateUserAddress = async (userId, addressId, addressData) => {
    try {
        console.log("Updating address for user:", userId, "addressId:", addressId, "data:", addressData);

        // Создаем объект, который включает ID адреса и данные для обновления
        const requestData = {
            id: addressId,
            ...addressData
        };

        console.log("Sending PATCH request with data:", requestData);
        const { data } = await $authhost.patch(`/user/${userId}/address/${addressId}`, requestData);

        console.log("Address updated successfully:", data);
        return data;
    } catch (error) {
        console.log("Update address error:", error);

        let errorMessage = "Ошибка при обновлении адреса";

        if (error.response) {
            if (error.response.status === 403) {
                errorMessage = "Доступ запрещен. Проверьте авторизацию";
            }
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверные данные адреса";
            }
            else if (error.response.status === 404) {
                errorMessage = "Пользователь или адрес не найден";
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