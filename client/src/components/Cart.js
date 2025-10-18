import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import cartStore from '../store/CartStore';
import { createOrder } from '../http/orderApi';
import { getUserAddresses } from '../http/userApi';
import { getCurrentUser } from '../http/authApi';
import './Cart.css';

const Cart = observer(() => {
    const { items, totalPrice, totalItems, isOpen, toggleCart, updateQuantity, removeFromCart, clearCart } = cartStore;
    const [isLoading, setIsLoading] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // Загружаем адреса при открытии корзины
    useEffect(() => {
        if (isOpen && items.length > 0) {
            loadUserAddresses();
        }
    }, [isOpen, items.length]);

    const loadUserAddresses = async () => {
        setIsLoadingAddresses(true);
        try {
            // Получаем текущего пользователя
            const userData = await getCurrentUser();
            const userId = userData.id;

            // Загружаем адреса пользователя
            const addressesData = await getUserAddresses(userId);
            setAddresses(addressesData);

            // Автоматически выбираем первый адрес, если есть
            if (addressesData.length > 0 && !selectedAddressId) {
                setSelectedAddressId(addressesData[0].id);
            }
        } catch (error) {
            console.error("Ошибка загрузки адресов:", error);
            setOrderError("Не удалось загрузить адреса доставки");
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const getSelectedAddress = () => {
        return addresses.find(addr => addr.id === selectedAddressId) || addresses[0];
    };

    const handleCreateOrder = async () => {
        if (items.length === 0) return;
        if (addresses.length === 0) {
            setOrderError("Необходимо добавить адрес доставки");
            return;
        }

        setIsLoading(true);
        setOrderError('');

        try {
            const selectedAddress = getSelectedAddress();

            const orderData = {
                address: {
                    id: selectedAddress.id,
                    addressLine1: selectedAddress.addressLine1,
                    addressLine2: selectedAddress.addressLine2 || "",
                    city: selectedAddress.city,
                    country: selectedAddress.country
                },
                quantities: items.map(item => ({
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

            const result = await createOrder(orderData);
            console.log("Заказ создан:", result);

            // Сначала сбрасываем состояния
            setIsLoading(false);
            setOrderError('');

            // Затем очищаем корзину и закрываем
            clearCart();
            toggleCart();

            alert('Заказ успешно создан!');

        } catch (error) {
            console.error("Ошибка создания заказа:", error);
            setOrderError(error.message);
            setIsLoading(false);
        }
    };

    const handleCloseCart = () => {
        setOrderError('');
        setIsLoading(false);
        toggleCart();
    };

    // Принудительно закрываем корзину если isOpen = false
    if (!isOpen) return null;

    return (
        <div className="cart-overlay" onClick={handleCloseCart}>
            <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>Корзина 🛒</h2>
                    <button className="close-btn" onClick={handleCloseCart}>×</button>
                </div>

                <div className="cart-content">
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-cart-icon">🛒</div>
                            <p>Ваша корзина пуста</p>
                            <span>Добавьте товары из каталога</span>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {items.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="item-info">
                                            <h4 className="item-name">{item.name}</h4>
                                            <p className="item-price">${item.price} × {item.quantity}</p>
                                            <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>

                                        <div className="item-controls">
                                            <div className="quantity-controls">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="quantity-btn"
                                                    disabled={isLoading}
                                                >
                                                    -
                                                </button>
                                                <span className="quantity">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="quantity-btn"
                                                    disabled={item.quantity >= (item.inventory?.quantity || 0) || isLoading}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="remove-btn"
                                                disabled={isLoading}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {items.length > 0 && (
                                <div className="address-section">
                                    <h3>Адрес доставки</h3>
                                    {isLoadingAddresses ? (
                                        <div className="loading-addresses">Загрузка адресов...</div>
                                    ) : addresses.length > 0 ? (
                                        <div className="address-selector">
                                            <select
                                                value={selectedAddressId}
                                                onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                                                className="address-select"
                                                disabled={isLoading}
                                            >
                                                {addresses.map(address => (
                                                    <option key={address.id} value={address.id}>
                                                        {address.addressLine1}, {address.city}, {address.country}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="selected-address-details">
                                                {getSelectedAddress() && (
                                                    <div className="address-info">
                                                        <p><strong>Адрес:</strong> {getSelectedAddress().addressLine1}</p>
                                                        {getSelectedAddress().addressLine2 && (
                                                            <p><strong>Дополнительно:</strong> {getSelectedAddress().addressLine2}</p>
                                                        )}
                                                        <p><strong>Город:</strong> {getSelectedAddress().city}</p>
                                                        <p><strong>Страна:</strong> {getSelectedAddress().country}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-addresses">
                                            <p>Нет сохраненных адресов</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {orderError && (
                                <div className="order-error">
                                    {orderError}
                                </div>
                            )}

                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Итого:</span>
                                    <span className="total-price">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="cart-actions">
                                    <button
                                        className="clear-btn"
                                        onClick={clearCart}
                                        disabled={isLoading}
                                    >
                                        Очистить корзину
                                    </button>
                                    <button
                                        className="checkout-btn"
                                        onClick={handleCreateOrder}
                                        disabled={isLoading || items.length === 0 || addresses.length === 0}
                                    >
                                        {isLoading ? 'Оформление...' : 'Оформить заказ'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default Cart;