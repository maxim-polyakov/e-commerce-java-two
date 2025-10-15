import React from 'react';
import { observer } from 'mobx-react-lite';
import cartStore from '../store/CartStore';
import './CartButton.css';

const CartButton = observer(() => {
    const { toggleCart, totalItems, totalPrice } = cartStore;

    return (
        <button className="cart-button" onClick={toggleCart}>
            <span className="cart-icon">🛒</span>
            <span className="cart-info">
                <span className="items-count">{totalItems} товаров</span>
                <span className="total-price">${totalPrice.toFixed(2)}</span>
            </span>
        </button>
    );
});

export default CartButton;