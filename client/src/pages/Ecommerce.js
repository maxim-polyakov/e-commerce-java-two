import React, { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import { useLocation } from 'react-router-dom';
import ProductList from '../components/ProductList';
import Cart from '../components/Cart';
import CartButton from '../components/CartButton';
import ProductShowcase from '../components/ProductShowcase';
import OrderHistory from '../components/OrderHistory';
import UserProfile from '../components/UserProfile';
import YandexRtbBanner from '../components/YandexRtbBanner';
import './Ecommerce.css';

const Ecommerce = observer(() => {
    const [activeSection, setActiveSection] = useState('showcase'); // 'showcase', 'catalog', 'orders', 'profile'
    const location = useLocation();

    // ОБРАБОТКА СОСТОЯНИЯ ПРИ ПЕРЕХОДЕ ИЗ СТРАНИЦЫ ТОВАРА
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveSection(location.state.activeTab);
        }
    }, [location.state]);

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
                        <button
                            className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveSection('profile')}
                        >
                            👤 Профиль
                        </button>
                    </nav>
                    <CartButton />
                </div>
            </header>

            <YandexRtbBanner />

            <main className="ecommerce-main">
                {activeSection === 'showcase' && <ProductShowcase />}
                {activeSection === 'catalog' && <ProductList />}
                {activeSection === 'orders' && <OrderHistory />}
                {activeSection === 'profile' && <UserProfile />}
            </main>

            <Cart />
        </div>
    );
});

export default Ecommerce;