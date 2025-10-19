import React, { useState, useEffect } from 'react';
import { createPayment } from '../http/paymentApi';
import { observer } from 'mobx-react-lite';
import { PAYMENT_SUCCESS_ROUTE, BASE_URL } from '../utils/consts';
import './Checkout.css';

const Checkout = observer(() => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [checkoutData, setCheckoutData] = useState(null);

    useEffect(() => {
        // Получаем данные из localStorage
        const savedCheckoutData = localStorage.getItem('checkoutData');
        if (savedCheckoutData) {
            setCheckoutData(JSON.parse(savedCheckoutData));
        }
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!checkoutData) {
                throw new Error('Данные заказа не найдены');
            }

            const totalAmount = checkoutData.totalPrice;

            // Правильно считаем общее количество товаров
            const totalItemsCount = checkoutData.cartItems.reduce((total, item) => total + item.quantity, 0);

            // Создаем описание с учетом quantity
            const itemDetails = checkoutData.cartItems.map(item =>
                `${item.name}${item.quantity > 1 ? ` (${item.quantity} шт.)` : ''}`
            ).join(', ');

            const orderId = Date.now();
            const orderDescription = `Заказ #${orderId} из ${totalItemsCount} товаров: ${itemDetails}`;

            const returnUrl = `${BASE_URL}${PAYMENT_SUCCESS_ROUTE}`;

            const paymentResponse = await createPayment(totalAmount, orderDescription, returnUrl);

            // НЕ очищаем корзину здесь - это сделаем после успешного создания заказа
            // НЕ очищаем localStorage здесь - данные нужны для создания заказа

            window.location.href = paymentResponse.confirmation.confirmation_url;

        } catch (err) {
            setError(err.message);
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!checkoutData) {
        return (
            <div className="checkout-page">
                <h2>Оформление заказа</h2>
                <div className="error-message">Данные заказа не найдены</div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h2>Оформление заказа</h2>

            <div className="order-summary">
                <h3>Ваш заказ</h3>
                {checkoutData.cartItems.map(item => (
                    <div key={item.id} className="order-item">
                        <span>{item.name}</span>
                        <span>{item.quantity} x {item.price}₽</span>
                    </div>
                ))}
                <div className="order-total">
                    <strong>Итого: {checkoutData.totalPrice}₽</strong>
                </div>
            </div>

            <div className="delivery-address">
                <h3>Адрес доставки</h3>
                <p>{checkoutData.address.addressLine1}, {checkoutData.address.city}, {checkoutData.address.country}</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading}
                className="payment-button"
            >
                {loading ? 'Обработка...' : 'Перейти к оплате'}
            </button>
        </div>
    );
});

export default Checkout;