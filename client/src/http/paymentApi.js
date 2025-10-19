import { $authhost } from ".";

export const createPayment = async (amount, description, returnUrl) => {
    try {
        console.log("Creating payment:", { amount, description, returnUrl });

        const paymentData = {
            amount: amount.toFixed(2),
            description: description,
            confirmationReturnUrl: returnUrl
        };

        const { data } = await $authhost.post('/pay', paymentData);

        console.log("Payment created successfully:", data);
        return data;
    } catch (error) {
        console.log("Create payment error:", error);

        let errorMessage = "Ошибка при создании платежа";

        if (error.response) {
            if (error.response.status === 403) {
                errorMessage = "Доступ запрещен. Проверьте авторизацию";
            }
            else if (error.response.status === 400) {
                errorMessage = error.response.data?.message || "Неверные данные платежа";
            }
            else if (error.response.status === 402) {
                errorMessage = "Ошибка оплаты. Проверьте данные карты";
            }
            else if (error.response.status === 404) {
                errorMessage = "Платежный сервис недоступен";
            }
            else if (error.response.status === 500) {
                errorMessage = "Внутренняя ошибка платежного сервиса";
            }
            else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        }
        else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
            errorMessage = "Не удалось подключиться к платежному сервису";
        }
        else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};