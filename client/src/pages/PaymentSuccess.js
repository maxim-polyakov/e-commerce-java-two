import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createOrder } from '../http/orderApi';
import { ECOMMERCE_ROUTE } from '../utils/consts';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [error, setError] = useState('');

    useEffect(() => {
        const processSuccessfulPayment = async () => {
            try {
                // Получаем данные заказа из localStorage
                const checkoutData = localStorage.getItem('checkoutData');

                if (!checkoutData) {
                    throw new Error('Данные заказа не найдены');
                }

                const { address, cartItems } = JSON.parse(checkoutData);

                // Создаем заказ после успешной оплаты
                const orderData = {
                    address: {
                        id: address.id,
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2 || "",
                        city: address.city,
                        country: address.country
                    },
                    quantities: cartItems.map(item => ({
                        id: item.id,
                        product: {
                            id: item.id,
                            name: item.name,
                            shortDescription: item.shortDescription || "",
                            longDescription: item.longDescription || "",
                            price: item.price,
                            inventory: {
                                id: item.inventory?.id || 1,
                                quantity: item.inventory?.quantity || 0
                            }
                        },
                        quantity: item.quantity
                    }))
                };

                console.log('Создание заказа с данными:', orderData);
                const result = await createOrder(orderData);
                console.log("Заказ успешно создан:", result);

                // Очищаем localStorage после успешного создания заказа
                localStorage.removeItem('checkoutData');

                setStatus('success');

                // Запускаем таймер для редиректа
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            navigate(ECOMMERCE_ROUTE);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);

            } catch (error) {
                console.error("Ошибка при создании заказа:", error);
                setStatus('error');
                setError(error.message);
            }
        };

        processSuccessfulPayment();
    }, [navigate]);

    const handleReturnHome = () => {
        navigate(ECOMMERCE_ROUTE);
    };

    const handleRetry = () => {
        setStatus('processing');
        setError('');
        window.location.reload();
    };

    const getStatusClass = () => {
        switch (status) {
            case 'processing': return 'processing-status';
            case 'success': return 'success-status';
            case 'error': return 'error-status';
            default: return '';
        }
    };

    return (
        <div className="payment-success-page">
            <div className={`success-content ${getStatusClass()}`}>
                {status === 'processing' && (
                    <>
                        <div className="loading-icon pulse">⏳</div>
                        <h1>Обрабатываем ваш заказ...</h1>
                        <p>Пожалуйста, подождите</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-icon">✅</div>
                        <h1>Заказ успешно оформлен!</h1>
                        <p>Спасибо за ваш заказ. Мы обработаем его в ближайшее время.</p>
                        <p className="countdown-text">Вы будете перенаправлены в магазин через {countdown} секунд...</p>
                        <button
                            onClick={handleReturnHome}
                            className="return-home-btn"
                        >
                            Вернуться в магазин
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="error-icon">❌</div>
                        <h1>Ошибка при оформлении заказа</h1>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button
                                onClick={handleRetry}
                                className="retry-btn"
                            >
                                Попробовать снова
                            </button>
                            <button
                                onClick={handleReturnHome}
                                className="return-home-btn error-page"
                            >
                                Вернуться в магазин
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;