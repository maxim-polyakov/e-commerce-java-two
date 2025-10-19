import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getProducts } from '../http/productApi';
import cartStore from '../store/CartStore';
import './ProductList.css';

const ProductList = observer(() => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsData = await getProducts();
                setProducts(productsData);
            } catch (err) {
                setError('Не удалось загрузить продукты. Проверьте авторизацию.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = (product) => {
        cartStore.addToCart(product);
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загружаем продукты...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Произошла ошибка</h3>
            <p>{error}</p>
            <button
                className="retry-button"
                onClick={() => window.location.reload()}
            >
                Попробовать снова
            </button>
        </div>
    );

    return (
        <div className="products-container">
            <h2 className="products-title">Наши продукты</h2>
            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-header">
                            <h3 className="product-name">{product.name}</h3>
                            <span className="product-price">{product.price}₽</span>
                        </div>

                        <div className="product-badges">
                            <span className="inventory-badge">
                                📦 {product.inventory.quantity} в наличии
                            </span>
                        </div>

                        <div className="product-descriptions">
                            <p className="short-description">{product.shortDescription}</p>
                            <p className="long-description">{product.longDescription}</p>
                        </div>

                        <div className="product-actions">
                            <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(product)}
                                disabled={product.inventory.quantity === 0}
                            >
                                {product.inventory.quantity === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ProductList;