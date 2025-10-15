import React, { useState, useMemo } from 'react';
import { observer } from "mobx-react-lite";
import ProductList from './ProductList';
import Cart from './Cart';
import CartButton from './CartButton';
import ProductShowcase from './ProductShowcase'; // Новая компонента витрины
import './Ecommerce.css';

const Ecommerce = observer(() => {
    const [activeSection, setActiveSection] = useState('showcase'); // 'showcase' или 'catalog'

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
                    </nav>
                    <CartButton />
                </div>
            </header>

            <main className="ecommerce-main">
                {activeSection === 'showcase' ? (
                    <ProductShowcase />
                ) : (
                    <ProductList />
                )}
            </main>

            <Cart />
        </div>
    );
});

export default Ecommerce;