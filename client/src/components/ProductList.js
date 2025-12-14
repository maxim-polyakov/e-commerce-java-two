import React, { useState, useEffect, useContext, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../http/productApi';
import { getDescriptionByProductId } from '../http/descriptionApi';
import cartStore from '../store/CartStore';
import { Context } from '../index';
import AddProduct from './AddProduct';
import ProductDescription from './ProductDescription';
import ProductTooltip from './ProductTooltip';
import { getProductRoute } from '../utils/consts';
import './ProductList.css';

const ProductList = observer(() => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deletingProductId, setDeletingProductId] = useState(null);
    const [hoveredProduct, setHoveredProduct] = useState(null); // КЛЮЧЕВОЕ СОСТОЯНИЕ
    const [descriptions, setDescriptions] = useState({});

    const { user } = useContext(Context);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const API_BASE_URL = process.env.REACT_APP_S3_URL;
    const IMAGES_BASE_URL = `${API_BASE_URL}`;


    const tooltipTimeoutRef = useRef(null);
    const isMouseOnTooltipRef = useRef(false);

    // Очистка таймаута при размонтировании
    useEffect(() => {
        return () => {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
        };
    }, []);

    const fetchDescription = async (productId) => {
        try {
            const description = await getDescriptionByProductId(productId);
            return description;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Ошибка загрузки описания для товара ${productId}:`, error);
            return null;
        }
    };

    const fetchAllDescriptions = async (productsList) => {
        const descriptionsMap = {};
        const descriptionPromises = productsList.map(async (product) => {
            const description = await fetchDescription(product.id);
            if (description) {
                descriptionsMap[product.id] = description;
            }
        });
        await Promise.all(descriptionPromises);
        return descriptionsMap;
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts(currentPage, itemsPerPage);

            if (response && response.content && Array.isArray(response.content)) {
                setProducts(response.content);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);

                const descriptionsData = await fetchAllDescriptions(response.content);
                setDescriptions(descriptionsData);
            } else {
                console.warn('Unexpected response format:', response);
                setProducts([]);
                setTotalPages(0);
                setTotalElements(0);
                setDescriptions({});
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

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('https')) return imagePath;
        return `${IMAGES_BASE_URL}/${imagePath}`;
    };

    const handleAddToCart = (product) => {
        cartStore.addToCart(product);
    };

    const handleProductClick = (product) => {
        navigate(getProductRoute(product.id));
    };

    const handleAddProduct = () => {
        setIsAddProductOpen(true);
    };

    const handleProductAdded = () => {
        fetchProducts();
        setCurrentPage(0);
    };

    const handleOpenDescription = (product) => {
        setSelectedProduct(product);
        setIsDescriptionOpen(true);
    };

    const handleCloseDescription = () => {
        setIsDescriptionOpen(false);
        setSelectedProduct(null);
    };

    const handleDescriptionUpdated = () => {
        fetchProducts();
    };

    // ИСПРАВЛЕННЫЕ ФУНКЦИИ ДЛЯ ТУЛТИПА
    const handleMouseEnter = async (product) => {
        // Очищаем предыдущий таймаут
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }

        const hasDescription = descriptions[product.id];

        if (hasDescription) {
            // СРАЗУ УСТАНАВЛИВАЕМ НОВЫЙ ТОВАР - старый тултип закроется автоматически
            setHoveredProduct(product);
        } else {
            try {
                const description = await fetchDescription(product.id);
                if (description) {
                    setDescriptions(prev => ({
                        ...prev,
                        [product.id]: description
                    }));
                    setHoveredProduct(product);
                }
            } catch (error) {
                console.error('Error fetching description for tooltip:', error);
            }
        }
    };

    const handleMouseLeave = () => {
        if (isMouseOnTooltipRef.current) {
            return;
        }

        tooltipTimeoutRef.current = setTimeout(() => {
            setHoveredProduct(null);
        }, 100);
    };

    const handleTooltipMouseEnter = () => {
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        isMouseOnTooltipRef.current = true;
    };

    const handleTooltipMouseLeave = () => {
        isMouseOnTooltipRef.current = false;
        tooltipTimeoutRef.current = setTimeout(() => {
            setHoveredProduct(null);
        }, 100);
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (!window.confirm(`Вы уверены, что хотите удалить продукт "${productName}"?`)) {
            return;
        }

        try {
            setDeletingProductId(productId);
            await deleteProduct(productId);
            alert('Продукт успешно удален');
            await fetchProducts();
            if (products.length === 1 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Ошибка при удалении продукта: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeletingProductId(null);
        }
    };

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
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

    const getPageNumbers = () => {
        if (totalPages <= 1) return [];
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    const isAdmin = user?.user?.ROLE === 'ADMIN';

    if (loading) return <div className="loading-container">Загружаем продукты...</div>;
    if (error) return <div className="error-container">{error}</div>;

    const pageNumbers = getPageNumbers();
    const displayPage = currentPage + 1;

    return (
        <div className="products-container">
            <AddProduct
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
                onProductAdded={handleProductAdded}
            />

            <ProductDescription
                productId={selectedProduct?.id}
                productName={selectedProduct?.name}
                isOpen={isDescriptionOpen}
                onClose={handleCloseDescription}
                onDescriptionUpdated={handleDescriptionUpdated}
            />

            <div className="products-header">
                <div className="products-title-section">
                    <h2 className="products-title">Наши продукты</h2>
                    {isAdmin && (
                        <button className="add-product-btn" onClick={handleAddProduct}>
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
                            const isDeleting = deletingProductId === product.id;
                            const hasDescription = !!descriptions[product.id];
                            const isHovered = hoveredProduct?.id === product.id; // ПРОВЕРКА НАВЕДЕНИЯ

                            return (
                                <div
                                    key={product.id}
                                    className={`product-card ${isDeleting ? 'deleting' : ''} ${hasDescription ? 'has-description' : ''}`}
                                    onMouseEnter={() => handleMouseEnter(product)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => handleProductClick(product)}
                                >
                                    {isAdmin && (
                                        <button
                                            className="delete-product-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProduct(product.id, product.name);
                                            }}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? '⌛' : '×'}
                                        </button>
                                    )}

                                    <div className="product-image-section">
                                        <div className="product-image-container">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={product.name} className="product-image" />
                                            ) : (
                                                <div className="image-placeholder">🛍️</div>
                                            )}
                                        </div>

                                        <div className="product-badges-overlay">
                                            <span className="inventory-badge">
                                                📦 {inventoryQuantity}
                                            </span>
                                            {hasDescription && (
                                                <span className="description-badge" title="Есть подробное описание">
                                                    📋
                                                </span>
                                            )}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                disabled={isOutOfStock || isDeleting}
                                            >
                                                {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
                                            </button>

                                            {isAdmin && (
                                                <button
                                                    className="description-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDescription(product);
                                                    }}
                                                >
                                                    {hasDescription ? '✏️ Описание' : '📝 Добавить описание'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Тултип показывается ТОЛЬКО при наведении */}
                                    {hasDescription && descriptions[product.id] && isHovered && (
                                        <div
                                            onMouseEnter={handleTooltipMouseEnter}
                                            onMouseLeave={handleTooltipMouseLeave}
                                        >
                                            <ProductTooltip
                                                product={{
                                                    ...product,
                                                    description: descriptions[product.id]
                                                }}
                                                showOnProductsPage={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination">
                                <button
                                    className={`pagination-btn ${currentPage === 0 ? 'disabled' : ''}`}
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 0}
                                >
                                    ← Назад
                                </button>

                                <div className="page-numbers">
                                    {pageNumbers.map(pageNumber => (
                                        <button
                                            key={pageNumber}
                                            className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                            onClick={() => goToPage(pageNumber)}
                                        >
                                            {pageNumber + 1}
                                        </button>
                                    ))}
                                </div>

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
                <div className="no-products">
                    <div className="no-products-icon">📦</div>
                    <h3>Продукты не найдены</h3>
                    <p>На данный момент нет доступных продуктов.</p>
                    {isAdmin && (
                        <button className="add-product-btn empty-state-btn" onClick={handleAddProduct}>
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