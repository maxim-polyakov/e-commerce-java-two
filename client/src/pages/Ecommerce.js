import React, { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import ProductList from './ProductList';
import Cart from './Cart';
import CartButton from './CartButton';
import ProductShowcase from './ProductShowcase';
import OrderHistory from './OrderHistory';
import { getCurrentUser } from '../http/userApi';
import './Ecommerce.css';

const Ecommerce = observer(() => {
    const [activeSection, setActiveSection] = useState('showcase');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Ошибка загрузки пользователя:', error);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="ecommerce">
            <header className="ecommerce-header">
                <div className="header-content">
                    <h1>🛍️ Интернет-магазин</h1>
                    <nav className="navigation">
                        <button
                            className={`nav-btn ${activeSection === 'showcase' ? 'active' : ''}`}
                            onClick={() => setActiveSection('showcase')}
                        >
                            🏠 Витрина
                        </button>
                        <button
                            className={`nav-btn ${activeSection === 'catalog' ? 'active' : ''}`}
                            onClick={() => setActiveSection('catalog')}
                        >
                            📋 Все товары
                        </button>
                        <button
                            className={`nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveSection('orders')}
                        >
                            📦 Мои заказы
                        </button>
                    </nav>

                    <div className="header-right">
                        {user && (
                            <div className="user-welcome">
                                Привет, <strong>{user.firstName}</strong>!
                            </div>
                        )}
                        <CartButton />
                    </div>
                </div>
            </header>

            <main className="ecommerce-main">
                {activeSection === 'showcase' && <ProductShowcase />}
                {activeSection === 'catalog' && <ProductList />}
                {activeSection === 'orders' && <OrderHistory />}
            </main>

            <Cart />
        </div>
    );
});

export default Ecommerce;