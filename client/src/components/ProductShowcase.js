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
    const [showAllFeatured, setShowAllFeatured] = useState(false);

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

    // Рекомендуемые товары (первые 3 или все)
    const featuredProducts = useMemo(() => {
        return showAllFeatured ? filteredAndSortedProducts : filteredAndSortedProducts.slice(0, 3);
    }, [filteredAndSortedProducts, showAllFeatured]);

    // Проверка наличия товара
    const isProductAvailable = (product) => {
        const inventoryQuantity = product.inventory?.quantity || 0;
        return inventoryQuantity > 0;
    };

    // Получение количества товара в наличии
    const getProductQuantity = (product) => {
        return product.inventory?.quantity || 0;
    };

    const handleAddToCart = (product) => {
        if (!isProductAvailable(product)) {
            return; // Не добавляем в корзину если товара нет в наличии
        }
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
    const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];

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
                <div className="featured-header">
                    <h3>🔥 Рекомендуемые товары</h3>
                    {safeProducts.length > 3 && (
                        <button
                            className="show-more-btn"
                            onClick={() => setShowAllFeatured(!showAllFeatured)}
                        >
                            {showAllFeatured ? 'Скрыть' : `Показать все (${safeProducts.length})`}
                        </button>
                    )}
                </div>

                {safeFeaturedProducts.length > 0 ? (
                    <div className="featured-grid">
                        {safeFeaturedProducts.map(product => {
                            const imageUrl = getImageUrl(product.image);
                            const isAvailable = isProductAvailable(product);
                            const availableQuantity = getProductQuantity(product);

                            return (
                                <div key={product.id} className="featured-card">
                                    <div className="featured-badge">🔥 Хит</div>

                                    {/* Бейдж отсутствия товара */}
                                    {!isAvailable && (
                                        <div className="out-of-stock-overlay">
                                            Нет в наличии
                                        </div>
                                    )}

                                    {/* ИСПРАВЛЕННЫЙ КОНТЕЙНЕР ДЛЯ ИЗОБРАЖЕНИЯ */}
                                    <div className="showcase-image-container">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                                style={{
                                                    opacity: isAvailable ? 1 : 0.6,
                                                    filter: isAvailable ? 'none' : 'grayscale(50%)'
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="showcase-image-placeholder"
                                            style={{
                                                display: imageUrl ? 'none' : 'flex',
                                                opacity: isAvailable ? 1 : 0.6
                                            }}
                                        >
                                            🛍️
                                        </div>
                                    </div>
                                    <div className="showcase-product-info">
                                        <h4>{product.name}</h4>
                                        <p className="showcase-product-description">{product.shortDescription}</p>

                                        {/* Информация о наличии */}
                                        <div className="availability-info">
                                            {isAvailable ? (
                                                <span className="in-stock">
                                                    📦 В наличии: {availableQuantity} шт.
                                                </span>
                                            ) : (
                                                <span className="out-of-stock">
                                                    ❌ Нет в наличии
                                                </span>
                                            )}
                                        </div>

                                        <div className="showcase-product-meta">
                                            <span className="showcase-price">{product.price}₽</span>
                                            <span className="showcase-rating">⭐ {product.raiting || '4.5'}</span>
                                        </div>
                                        <button
                                            className={`buy-now-btn ${!isAvailable ? 'disabled' : ''}`}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={!isAvailable}
                                        >
                                            {isAvailable ? 'Купить сейчас' : 'Нет в наличии'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="showcase-no-products">
                        <div className="showcase-no-products-icon">📦</div>
                        <h3>Продукты не найдены</h3>
                        <p>На данный момент нет доступных продуктов.</p>
                    </div>
                )}
            </section>
        </div>
    );
});

export default ProductShowcase;