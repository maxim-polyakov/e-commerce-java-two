import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getUserOrders } from '../http/orderApi';
import './OrderHistory.css';

const OrderHistory = observer(() => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersData = await getUserOrders();
                setOrders(ordersData);
            } catch (err) {
                setError('Не удалось загрузить историю заказов');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка заказов...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="order-history">
            <h2>Мои заказы</h2>

            {!orders || orders.length === 0 ? (
                <div className="no-orders">
                    <div className="empty-icon">📦</div>
                    <p>У вас пока нет заказов</p>
                    <span>Сделайте первый заказ и он появится здесь</span>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => {
                        // Проверка существования order и его свойств
                        if (!order) return null;

                        const orderId = order.id || 'Нет ID';
                        const user = order.user || {};
                        const address = order.address || {};
                        const items = order.quantities || order.items || [];

                        return (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <h3>Заказ #{orderId}</h3>
                                    <div className="order-meta">
                                        <span className="order-user">
                                            Для: {user.firstName || ''} {user.lastName || ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-address">
                                    <h4>Адрес доставки:</h4>
                                    {address.addressLine && <p>{address.addressLine}</p>}
                                    {address.city && address.country ? (
                                        <p>{address.city}, {address.country}</p>
                                    ) : (
                                        <p>Адрес не указан</p>
                                    )}
                                </div>

                                {items.length > 0 ? (
                                    <div className="order-items">
                                        <h4>Состав заказа:</h4>
                                        {items.map(item => {
                                            const product = item.product || {};
                                            const quantity = item.quantity || 0;
                                            const price = product.price || 0;

                                            return (
                                                <div key={item.id || item.productId} className="order-item">
                                                    <div className="item-info">
                                                        <span className="product-name">
                                                            {product.name || 'Товар без названия'}
                                                        </span>
                                                        {product.shortDescription && (
                                                            <span className="product-description">
                                                                {product.shortDescription}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="item-details">
                                                        <span className="item-quantity">
                                                            {quantity} × {price}₽
                                                        </span>
                                                        <span className="item-total">
                                                            {(price * quantity).toFixed(2)}₽
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="order-items">
                                        <p>Нет товаров в заказе</p>
                                    </div>
                                )}

                                <div className="order-footer">
                                    <div className="order-total">
                                        <strong>
                                            Общая сумма: {
                                            items.reduce((total, item) => {
                                                const product = item.product || {};
                                                return total + ((product.price || 0) * (item.quantity || 0));
                                            }, 0).toFixed(2)
                                        }₽
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

export default OrderHistory;