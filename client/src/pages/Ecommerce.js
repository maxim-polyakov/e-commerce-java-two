import React from 'react';
import { observer } from "mobx-react-lite";
import ProductList from './ProductList';
import Cart from './Cart';
import CartButton from './CartButton'; // Создадим кнопку корзины
import './Ecommerce.css';

const Ecommerce = observer(() => {
    return (
        <div className="ecommerce">
            <header className="ecommerce-header">
                <h1>🛍️ Интернет-магазин</h1>
                <CartButton />
            </header>

            <main className="ecommerce-main">
                <ProductList />
            </main>

            <Cart />
        </div>
    );
});

export default Ecommerce;