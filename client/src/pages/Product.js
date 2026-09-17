import React, { useCallback, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { getProductById } from '../http/productApi';
import { getDescriptionByProductId } from '../http/descriptionApi';
import cartStore from '../store/CartStore';
import CartButton from '../components/CartButton';
import Cart from '../components/Cart';
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

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerceapi.baxic.ru';
    const IMAGES_BASE_URL = `${API_BASE_URL}/images`;

    // Функция для загрузки описания товара
    const fetchDescription = useCallback(async (productId) => {
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
    }, []);

    const fetchProductData = useCallback(async () => {
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
    }, [id, fetchDescription]);

    useEffect(() => {
        if (id) {
            fetchProductData();
        }
    }, [id, fetchProductData]);

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

    // Функция для отображения характеристик
    const renderSpecifications = () => {
        if (!description) return null;

        const specs = [];

        // Основные параметры
        if (description.model || description.articleSku || description.dimensions || description.weight) {
            specs.push(
                <div key="basic" className="specs-group">
                    <h4 className="specs-group-title">Основные параметры</h4>
                    <div className="specs-list">
                        {description.model && (
                            <div className="spec-item">
                                <span className="spec-label">Модель:</span>
                                <span className="spec-value">{description.model}</span>
                            </div>
                        )}
                        {description.articleSku && (
                            <div className="spec-item">
                                <span className="spec-label">Артикул:</span>
                                <span className="spec-value">{description.articleSku}</span>
                            </div>
                        )}
                        {description.dimensions && (
                            <div className="spec-item">
                                <span className="spec-label">Габариты:</span>
                                <span className="spec-value">{description.dimensions}</span>
                            </div>
                        )}
                        {description.weight && (
                            <div className="spec-item">
                                <span className="spec-label">Вес:</span>
                                <span className="spec-value">{description.weight}</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Технические характеристики
        if (description.powerConsumption || description.capacity || description.colorFinish) {
            specs.push(
                <div key="technical" className="specs-group">
                    <h4 className="specs-group-title">Технические характеристики</h4>
                    <div className="specs-list">
                        {description.powerConsumption && (
                            <div className="spec-item">
                                <span className="spec-label">Потребление:</span>
                                <span className="spec-value">{description.powerConsumption}</span>
                            </div>
                        )}
                        {description.capacity && (
                            <div className="spec-item">
                                <span className="spec-label">Емкость:</span>
                                <span className="spec-value">{description.capacity}</span>
                            </div>
                        )}
                        {description.colorFinish && (
                            <div className="spec-item">
                                <span className="spec-label">Цвет/отделка:</span>
                                <span className="spec-value">{description.colorFinish}</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Дополнительные характеристики
        if (description.materials || description.warranty || description.countryOfOrigin) {
            specs.push(
                <div key="additional" className="specs-group">
                    <h4 className="specs-group-title">Дополнительно</h4>
                    <div className="specs-list">
                        {description.materials && (
                            <div className="spec-item">
                                <span className="spec-label">Материалы:</span>
                                <span className="spec-value">{description.materials}</span>
                            </div>
                        )}
                        {description.warranty && (
                            <div className="spec-item">
                                <span className="spec-label">Гарантия:</span>
                                <span className="spec-value">{description.warranty}</span>
                            </div>
                        )}
                        {description.countryOfOrigin && (
                            <div className="spec-item">
                                <span className="spec-label">Страна производства:</span>
                                <span className="spec-value">{description.countryOfOrigin}</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return specs;
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
            <Cart />

            <header className="product-detail-header">
                <div className="product-header-content">
                    <button onClick={handleBackClick} className="back-button">
                        ← Назад к товарам
                    </button>
                    <h1 className="product-page-title">Интернет-магазин</h1>
                    <div className="cart-button-wrapper">
                        <CartButton />
                    </div>
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
                </div>
            </div>
            {hasDescription && description && (
                <div className="product-specifications">
                    <h3>Характеристики</h3>
                    <div className="specifications-content">
                        {renderSpecifications()}
                    </div>
                </div>
            )}

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