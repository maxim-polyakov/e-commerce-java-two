import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { getProductById } from '../http/productApi';
import { getDescriptionByProductId } from '../http/descriptionApi';
import cartStore from '../store/CartStore';
import { Context } from '../index';
import ProductTooltip from '../components/ProductTooltip';
import CartButton from '../components/CartButton';
import Cart from '../components/Cart'; // Добавьте импорт корзины
import { ECOMMERCE_ROUTE } from '../utils/consts';
import './Product.css';

const Product = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [description, setDescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    const { user } = useContext(Context);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerceapi.baxic.ru';
    const IMAGES_BASE_URL = `${API_BASE_URL}/images`;

    // Функция для загрузки описания товара
    const fetchDescription = async (productId) => {
        try {
            const desc = await getDescriptionByProductId(productId);
            return desc;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Ошибка загрузки описания для товара ${productId}:`, error);
            return null;
        }
    };

    const fetchProductData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Загружаем данные товара
            const productData = await getProductById(id);
            setProduct(productData);

            // Загружаем описание товара
            const descData = await fetchDescription(id);
            setDescription(descData);

        } catch (err) {
            console.error('Fetch product error:', err);
            setError('Товар не найден или произошла ошибка при загрузке.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProductData();
        }
    }, [id]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGES_BASE_URL}/${imagePath}`;
    };

    const handleAddToCart = () => {
        if (product) {
            cartStore.addToCart(product);
        }
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
    };

    const handleBackClick = () => {
        navigate(ECOMMERCE_ROUTE, {
            state: { activeTab: 'catalog' }
        });
    };

    if (loading) {
        return (
            <div className="product-detail-loading">
                <div className="loading-spinner"></div>
                <p>Загружаем информацию о товаре...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-error">
                <div className="error-icon">❌</div>
                <h2>Товар не найден</h2>
                <p>{error || 'Запрошенный товар не существует.'}</p>
                <div className="error-actions">
                    <button onClick={handleBackClick} className="back-btn">
                        ← Назад к товарам
                    </button>
                    <Link
                        to={ECOMMERCE_ROUTE}
                        state={{ activeTab: 'catalog' }}
                        className="shop-link"
                    >
                        Вернуться к товарам
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = getImageUrl(product.image);
    const inventoryQuantity = product.inventory?.quantity || 0;
    const isOutOfStock = inventoryQuantity === 0;
    const hasDescription = !!description;

    return (
        <div className="product-detail-page">
            {/* ДОБАВЛЕНА КОРЗИНА */}
            <Cart />

            {/* ХЕДЕР С КНОПКОЙ КОРЗИНЫ */}
            <header className="product-detail-header">
                <div className="product-header-content">
                    <button onClick={handleBackClick} className="back-button">
                        ← Назад к товарам
                    </button>
                    <h1 className="product-page-title">Интернет-магазин</h1>
                    <CartButton />
                </div>
            </header>

            <nav className="breadcrumb">
                <Link to="/" className="breadcrumb-link">Главная</Link>
                <span className="breadcrumb-separator">/</span>
                <Link
                    to={ECOMMERCE_ROUTE}
                    state={{ activeTab: 'catalog' }}
                    className="breadcrumb-link"
                >
                    Все товары
                </Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{product.name}</span>
            </nav>

            <div className="product-detail-container">
                <div className="product-image-column">
                    <div className="product-image-main">
                        {imageUrl ? (
                            <>
                                {imageLoading && (
                                    <div className="image-loading-placeholder">
                                        <div className="loading-spinner"></div>
                                    </div>
                                )}
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className={`product-detail-image ${imageLoading ? 'loading' : ''}`}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            </>
                        ) : (
                            <div className="image-placeholder-large">
                                🛍️
                            </div>
                        )}
                    </div>

                    <div className="product-badges">
                        <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                            {isOutOfStock ? 'Нет в наличии' : `В наличии: ${inventoryQuantity} шт.`}
                        </span>
                        {hasDescription && (
                            <span className="description-badge" title="Есть подробное описание">
                                📋 Подробное описание
                            </span>
                        )}
                    </div>
                </div>

                <div className="product-info-column">
                    <div className="product-header-detail">
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-price-detail">{product.price}₽</div>
                    </div>

                    {product.raiting && (
                        <div className="product-rating">
                            <span className="rating-stars">
                                {'★'.repeat(Math.floor(product.raiting))}
                                {'☆'.repeat(5 - Math.floor(product.raiting))}
                            </span>
                            <span className="rating-value">({product.raiting})</span>
                        </div>
                    )}

                    <div className="product-descriptions-detail">
                        {product.shortDescription && (
                            <p className="product-short-description">{product.shortDescription}</p>
                        )}
                        {product.longDescription && (
                            <div className="product-long-description">
                                <h3>Описание</h3>
                                <p>{product.longDescription}</p>
                            </div>
                        )}
                    </div>

                    <div className="product-actions-detail">
                        <button
                            className={`add-to-cart-btn-detail ${isOutOfStock ? 'disabled' : ''}`}
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
                        </button>
                    </div>

                    {/* Блок с характеристиками, если есть описание */}
                    {hasDescription && description && (
                        <div className="product-specifications">
                            <h3>Характеристики</h3>
                            <ProductTooltip
                                product={{
                                    ...product,
                                    description: description
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="product-additional-info">
                <div className="info-section">
                    <h3>🚚 Доставка</h3>
                    <p>Быстрая доставка по всему городу. Сроки и стоимость уточняйте при оформлении заказа.</p>
                </div>

                <div className="info-section">
                    <h3>🔄 Возврат</h3>
                    <p>Гарантия возврата в течение 14 дней при сохранении товарного вида.</p>
                </div>

                <div className="info-section">
                    <h3>📞 Поддержка</h3>
                    <p>Наша служба поддержки всегда готова помочь с выбором и ответить на вопросы.</p>
                </div>
            </div>
        </div>
    );
});

export default Product;