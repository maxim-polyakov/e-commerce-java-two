import React, { useCallback, useState, useMemo, useEffect } from 'react';
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
    const API_BASE_URL = process.env.REACT_APP_S3_URL;
    const IMAGES_BASE_URL = `${API_BASE_URL}`;

    const fetchAllProducts = useCallback(async () => {
        try {
            let allProducts = [];
            let currentPage = 0;
            let hasMore = true;

            while (hasMore) {
                const response = await getProducts(currentPage, 10);

                if (response && response.content && Array.isArray(response.content)) {
                    allProducts = [...allProducts, ...response.content];

                    // Проверяем, есть ли еще страницы
                    hasMore = !response.last && response.content.length > 0;
                    currentPage++;

                    console.log(`Загружена страница ${currentPage}, всего товаров: ${allProducts.length}`);
                } else {
                    hasMore = false;
                }
            }

            return allProducts;
        } catch (error) {
            console.error('Error loading all products:', error);
            throw error;
        }
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const allProducts = await fetchAllProducts();
                console.log('Total products loaded:', allProducts.length);
                setProducts(allProducts);
            } catch (err) {
                setError('Не удалось загрузить продукты.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [fetchAllProducts]);

    // Функция для получения полного URL изображения
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // Если уже полный URL, возвращаем как есть
        if (imagePath.startsWith('https')) {
            return imagePath;
        }

        // Если только имя файла, добавляем базовый путь
        return `${IMAGES_BASE_URL}/${imagePath}`;
    };

    // Категории (в реальном приложении получаем с сервера)
    const categories = useMemo(() => {
        const safeProducts = Array.isArray(products) ? products : [];
        const uniqueCategories = [...new Set(safeProducts.map(p => p.category))].filter(Boolean);
        return ['all', ...uniqueCategories];
    }, [products]);

    // Функция для фильтрации товаров (общая для основного списка и топа)
    const filterProducts = useCallback((productsList) => {
        const safeProducts = Array.isArray(productsList) ? productsList : [];

        return safeProducts.filter(product => {
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            return matchesCategory && matchesPrice;
        });
    }, [selectedCategory, priceRange]);

    // Функция для сортировки товаров
    const sortProducts = useCallback((productsList) => {
        const sortedProducts = [...productsList];

        sortedProducts.sort((a, b) => {
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

        return sortedProducts;
    }, [sortBy]);

    // Топ-3 товара по рейтингу с учетом фильтров И сортировки
    const topRatedProducts = useMemo(() => {
        // Сначала применяем фильтры ко всем товарам
        const filteredProducts = filterProducts(products);

        // Затем сортируем отфильтрованные товары по ВЫБРАННОМУ КРИТЕРИЮ
        const sortedProducts = sortProducts(filteredProducts);

        // Берем первые 3 товара из отсортированного списка
        const topThree = sortedProducts.slice(0, 3);

        console.log('Топ-3 товара (с учетом фильтров и сортировки):', sortBy);
        topThree.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - рейтинг: ${product.raiting}, цена: ${product.price}₽`);
        });

        return topThree;
    }, [products, filterProducts, sortProducts, sortBy]);

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
            return;
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

    const safeTopRatedProducts = Array.isArray(topRatedProducts) ? topRatedProducts : [];

    // Функция для получения текста сортировки
    const getSortText = () => {
        switch (sortBy) {
            case 'price-asc': return 'цене (возрастание)';
            case 'price-desc': return 'цене (убывание)';
            case 'name': return 'названию';
            case 'popular': return 'рейтингу';
            default: return 'названию';
        }
    };

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

            {/* Топ-3 товара по рейтингу */}
            <section className="featured-products">
                <div className="featured-header">
                    <h3>⭐ Топ-3 товара</h3>
                    <p className="featured-subtitle">
                        {safeTopRatedProducts.length > 0
                            ? `(отсортировано по: ${getSortText()})`
                            : '(с учетом выбранных фильтров)'
                        }
                    </p>
                </div>

                {safeTopRatedProducts.length > 0 ? (
                    <div className="featured-grid">
                        {safeTopRatedProducts.map((product, index) => {
                            const imageUrl = getImageUrl(product.image);
                            const isAvailable = isProductAvailable(product);
                            const availableQuantity = getProductQuantity(product);
                            const rating = parseFloat(product.raiting) || 0;

                            return (
                                <div key={product.id} className="featured-card">
                                    {/* Бейдж с позицией в топе */}
                                    <div className="featured-badge">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} Топ {index + 1}
                                    </div>

                                    {/* Бейдж отсутствия товара */}
                                    {!isAvailable && (
                                        <div className="out-of-stock-overlay">
                                            Нет в наличии
                                        </div>
                                    )}

                                    {/* КОНТЕЙНЕР ДЛЯ ИЗОБРАЖЕНИЯ */}
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
                                            <span className="showcase-rating">⭐ {rating.toFixed(1)}</span>
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
                        <div className="showcase-no-products-icon">🔍</div>
                        <h3>Топ товары не найдены</h3>
                        <p>Попробуйте изменить параметры фильтров для отображения топовых товаров.</p>
                    </div>
                )}
            </section>
        </div>
    );
});

export default ProductShowcase;