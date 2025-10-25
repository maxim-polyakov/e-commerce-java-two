import React, { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getProducts } from '../http/productApi';
import cartStore from '../store/CartStore';
import './ProductShowcase.css';

const ProductShowcase = observer(() => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [priceRange, setPriceRange] = useState([0, 1000]);

    // Базовый URL для изображений
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerceapi.baxic.ru';
    const IMAGES_BASE_URL = `${API_BASE_URL}/images`;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                console.log('API Response:', response);

                // Извлекаем массив продуктов из объекта Page
                let productsData = [];
                if (response && response.content && Array.isArray(response.content)) {
                    productsData = response.content;
                } else if (Array.isArray(response)) {
                    productsData = response;
                } else {
                    console.warn('Unexpected response format:', response);
                    productsData = [];
                }

                console.log('Products data:', productsData);
                setProducts(productsData);
            } catch (err) {
                setError('Не удалось загрузить продукты.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Функция для получения полного URL изображения
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // Если уже полный URL, возвращаем как есть
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // Если только имя файла, добавляем базовый путь
        return `${IMAGES_BASE_URL}/${imagePath}`;
    };

    // Категории (в реальном приложении получаем с сервера)
    const categories = useMemo(() => {
        // Защита от не-массива
        const safeProducts = Array.isArray(products) ? products : [];
        const uniqueCategories = [...new Set(safeProducts.map(p => p.category))].filter(Boolean);
        return ['all', ...uniqueCategories];
    }, [products]);

    // Фильтрация и сортировка товаров
    const filteredAndSortedProducts = useMemo(() => {
        // Защита от не-массива
        const safeProducts = Array.isArray(products) ? products : [];

        let filtered = safeProducts.filter(product => {
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            return matchesCategory && matchesPrice;
        });

        // Сортировка
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'popular':
                    return (b.raiting || 0) - (a.raiting || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [products, selectedCategory, sortBy, priceRange]);

    const handleAddToCart = (product) => {
        cartStore.addToCart(product);
    };

    if (loading) return (
        <div className="showcase-loading">
            <div className="loading-spinner"></div>
            <p>Загружаем витрину...</p>
        </div>
    );

    if (error) return (
        <div className="showcase-error">
            <div className="error-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
        </div>
    );

    // Защита от не-массива для рендеринга
    const safeProducts = Array.isArray(filteredAndSortedProducts) ? filteredAndSortedProducts : [];

    return (
        <div className="product-showcase">
            {/* Герой-секция */}
            <section className="showcase-hero">
                <div className="hero-content">
                    <h2>Лучшие товары для вас</h2>
                    <p>Откройте для себя качественные продукты по выгодным ценам</p>
                </div>
            </section>

            {/* Фильтры и сортировка */}
            <section className="showcase-controls">
                <div className="controls-grid">
                    <div className="filter-group">
                        <label>Категория:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-select"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'Все категории' : category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Сортировка:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="name">По названию</option>
                            <option value="price-asc">По цене (возр.)</option>
                            <option value="price-desc">По цене (убыв.)</option>
                            <option value="popular">По популярности</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Цена: до {priceRange[1]}₽</label>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                            className="price-slider"
                        />
                    </div>
                </div>
            </section>

            {/* Рекомендуемые товары */}
            <section className="featured-products">
                <h3>🔥 Рекомендуемые товары</h3>
                {safeProducts.length > 0 ? (
                    <div className="featured-grid">
                        {safeProducts.slice(0, 3).map(product => {
                            const imageUrl = getImageUrl(product.image);
                            return (
                                <div key={product.id} className="featured-card">
                                    <div className="featured-badge">🔥 Хит</div>
                                    <div className="product-image">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="image-placeholder"
                                            style={{ display: imageUrl ? 'none' : 'flex' }}
                                        >
                                            🛍️
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        <h4>{product.name}</h4>
                                        <p className="product-description">{product.shortDescription}</p>
                                        <div className="product-meta">
                                            <span className="price">{product.price}₽</span>
                                            <span className="rating">⭐ {product.raiting || '4.5'}</span>
                                        </div>
                                        <button
                                            className="buy-now-btn"
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            Купить сейчас
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-products">
                        <p>Нет товаров для отображения</p>
                    </div>
                )}
            </section>

            {/* Баннер акции */}
            <section className="promo-banner">
                <div className="banner-content">
                    <h3>🎉 Специальное предложение!</h3>
                    <p>Получите скидку 15% на первый заказ</p>
                    <button className="promo-btn">Узнать больше</button>
                </div>
            </section>
        </div>
    );
});

export default ProductShowcase;