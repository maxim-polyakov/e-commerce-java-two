import React from 'react';
import { observer } from 'mobx-react-lite';
import cartStore from '../store/CartStore';
import './Cart.css';

const Cart = observer(() => {
    const { items, totalPrice, totalItems, isOpen, toggleCart, updateQuantity, removeFromCart, clearCart } = cartStore;

    if (!isOpen) return null;

    return (
        <div className="cart-overlay" onClick={toggleCart}>
            <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>Корзина 🛒</h2>
                    <button className="close-btn" onClick={toggleCart}>×</button>
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
                                                >
                                                    -
                                                </button>
                                                <span className="quantity">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="quantity-btn"
                                                    disabled={item.quantity >= item.inventory.quantity}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="remove-btn"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Итого:</span>
                                    <span className="total-price">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="cart-actions">
                                    <button className="clear-btn" onClick={clearCart}>
                                        Очистить корзину
                                    </button>
                                    <button className="checkout-btn">
                                        Оформить заказ
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