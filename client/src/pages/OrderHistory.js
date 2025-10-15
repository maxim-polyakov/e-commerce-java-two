import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getUserOrders } from '../http/productApi';
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

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="empty-icon">📦</div>
                    <p>У вас пока нет заказов</p>
                    <span>Сделайте первый заказ и он появится здесь</span>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <h3>Заказ #{order.id}</h3>
                                <div className="order-meta">
                                    <span className="order-user">
                                        Для: {order.user.firstName} {order.user.lastName}
                                    </span>
                                </div>
                            </div>

                            <div className="order-address">
                                <h4>Адрес доставки:</h4>
                                <p>{order.address.addressLine1}</p>
                                {order.address.addressLine2 && (
                                    <p>{order.address.addressLine2}</p>
                                )}
                                <p>{order.address.city}, {order.address.country}</p>
                            </div>

                            <div className="order-items">
                                <h4>Состав заказа:</h4>
                                {order.quantities.map(item => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-info">
                                            <span className="product-name">{item.product.name}</span>
                                            <span className="product-description">
                                                {item.product.shortDescription}
                                            </span>
                                        </div>
                                        <div className="item-details">
                                            <span className="item-quantity">
                                                {item.quantity} × ${item.product.price}
                                            </span>
                                            <span className="item-total">
                                                ${(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <div className="order-total">
                                    <strong>
                                        Общая сумма: $
                                        {order.quantities.reduce((total, item) =>
                                            total + (item.product.price * item.quantity), 0
                                        ).toFixed(2)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default OrderHistory;