import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { getProducts } from '../http/productApi';
import cartStore from '../store/CartStore';
import { Context } from '../index';
import AddProduct from './AddProduct'; // Импортируем компонент AddProduct
import './ProductList.css';

const ProductList = observer(() => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

    // Получаем user из контекста
    const { user } = useContext(Context);

    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Базовый URL для изображений
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerceapi.baxic.ru';
    const IMAGES_BASE_URL = `${API_BASE_URL}/images`;

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Получаем данные от бэкенда
            const response = await getProducts(currentPage, itemsPerPage);

            console.log('API Response:', response); // Для отладки

            // Обрабатываем Spring Data Page объект
            if (response && response.content && Array.isArray(response.content)) {
                setProducts(response.content);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            } else {
                // Fallback на случай неожиданного формата
                console.warn('Unexpected response format:', response);
                setProducts([]);
                setTotalPages(0);
                setTotalElements(0);
            }

        } catch (err) {
            setError('Не удалось загрузить продукты. Проверьте авторизацию.');
            console.error('Fetch products error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage]);

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

    const handleAddToCart = (product) => {
        cartStore.addToCart(product);
    };

    // Функция для открытия модального окна добавления продукта
    const handleAddProduct = () => {
        setIsAddProductOpen(true);
    };

    // Функция, которая вызывается после успешного добавления продукта
    const handleProductAdded = () => {
        // Обновляем список продуктов
        fetchProducts();
        // Возвращаем на первую страницу чтобы увидеть новый продукт
        setCurrentPage(0);
    };

    // Функции для навигации по страницам
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Прокрутка к верху страницы при смене страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Генерация номеров страниц для отображения
    const getPageNumbers = () => {
        if (totalPages <= 1) return [];

        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        // Корректируем startPage, если endPage достиг максимума
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    // Проверка, является ли пользователь ADMIN
    console.log(user?.user)
    const isAdmin = user?.user?.ROLE === 'ADMIN';

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

    const pageNumbers = getPageNumbers();
    const displayPage = currentPage + 1; // Для отображения пользователю (1-based)

    return (
        <div className="products-container">
            {/* Компонент AddProduct */}
            <AddProduct
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
                onProductAdded={handleProductAdded}
            />

            <div className="products-header">
                <div className="products-title-section">
                    <h2 className="products-title">Наши продукты</h2>
                    {/* Кнопка добавления продукта - только для ADMIN */}
                    {isAdmin && (
                        <button
                            className="add-product-btn"
                            onClick={handleAddProduct}
                            title="Добавить новый продукт"
                        >
                            <span className="add-product-icon">+</span>
                            Добавить продукт
                        </button>
                    )}
                </div>
                {totalElements > 0 && (
                    <div className="pagination-info">
                        Страница {displayPage} из {totalPages}
                        {totalElements > 0 && ` (${totalElements} товаров всего)`}
                    </div>
                )}
            </div>

            {products.length > 0 ? (
                <>
                    <div className="products-grid">
                        {products.map(product => {
                            const imageUrl = getImageUrl(product.image);
                            const inventoryQuantity = product.inventory?.quantity || 0;
                            const isOutOfStock = inventoryQuantity === 0;

                            return (
                                <div key={product.id} className="product-card">
                                    {/* Блок с изображением */}
                                    <div className="product-image-section">
                                        <div className="product-image-container">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="product-image"
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

                                        {/* Бейджи поверх изображения */}
                                        <div className="product-badges-overlay">
                                            <span className="inventory-badge">
                                                📦 {inventoryQuantity} в наличии
                                            </span>
                                            {isOutOfStock && (
                                                <span className="out-of-stock-badge">Нет в наличии</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="product-content">
                                        <div className="product-header">
                                            <h3 className="product-name">{product.name}</h3>
                                            <span className="product-price">{product.price}₽</span>
                                        </div>

                                        <div className="product-descriptions">
                                            <p className="short-description">{product.shortDescription}</p>
                                            <p className="long-description">{product.longDescription}</p>
                                        </div>

                                        <div className="product-actions">
                                            <button
                                                className="add-to-cart-btn"
                                                onClick={() => handleAddToCart(product)}
                                                disabled={isOutOfStock}
                                            >
                                                {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination">
                                {/* Кнопка "Назад" */}
                                <button
                                    className={`pagination-btn ${currentPage === 0 ? 'disabled' : ''}`}
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 0}
                                >
                                    ← Назад
                                </button>

                                {/* Номера страниц */}
                                <div className="page-numbers">
                                    {pageNumbers.map(pageNumber => (
                                        <button
                                            key={pageNumber}
                                            className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                            onClick={() => goToPage(pageNumber)}
                                        >
                                            {pageNumber + 1} {/* Отображаем 1-based */}
                                        </button>
                                    ))}
                                </div>

                                {/* Кнопка "Вперед" */}
                                <button
                                    className={`pagination-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    Вперед →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Сообщение, если нет продуктов */
                <div className="no-products">
                    <div className="no-products-icon">📦</div>
                    <h3>Продукты не найдены</h3>
                    <p>На данный момент нет доступных продуктов.</p>
                    {/* Кнопка добавления продукта в пустом состоянии - только для ADMIN */}
                    {isAdmin && (
                        <button
                            className="add-product-btn empty-state-btn"
                            onClick={handleAddProduct}
                        >
                            <span className="add-product-icon">+</span>
                            Добавить первый продукт
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});

export default ProductList;