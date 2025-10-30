import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createProduct, fileToBase64 } from '../http/productApi';
import './AddProduct.css';

const AddProduct = observer(({ isOpen, onClose, onProductAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        shortDescription: '',
        longDescription: '',
        price: '',
        raiting: '',
        quantity: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Проверка типа файла
            if (!file.type.startsWith('image/')) {
                setError('Пожалуйста, выберите файл изображения');
                return;
            }

            // Проверка размера файла (максимум 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Размер файла не должен превышать 5MB');
                return;
            }

            setImageFile(file);
            setError('');

            // Создание preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Валидация
            if (!imageFile) {
                throw new Error('Пожалуйста, выберите изображение');
            }

            if (!formData.name.trim()) {
                throw new Error('Название продукта обязательно');
            }

            if (!formData.price || formData.price <= 0) {
                throw new Error('Цена должна быть положительным числом');
            }

            // Используем fileToBase64 из productApi
            const base64Image = await fileToBase64(imageFile);

            // Подготавливаем данные для отправки
            const productData = {
                ...formData,
                image: base64Image,
                imageName: imageFile.name,
                price: parseFloat(formData.price),
                rating: formData.rating ? parseFloat(formData.rating) : 0,
                quantity: parseInt(formData.quantity) || 0
            };

            // Отправляем запрос
            await createProduct(productData);

            // Успех - закрываем модальное окно и обновляем список
            onProductAdded();
            handleClose();

        } catch (err) {
            setError(err.message);
            console.error('Error creating product:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Сбрасываем форму при закрытии
        setFormData({
            name: '',
            shortDescription: '',
            longDescription: '',
            price: '',
            rating: '',
            quantity: ''
        });
        setImageFile(null);
        setPreviewUrl('');
        setError('');
        setLoading(false);
        onClose();
    };

    // Закрытие по клику на фон
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Закрытие по ESC
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.keyCode === 27 && isOpen) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Добавить новый продукт</h2>
                    <button
                        className="close-button"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-scrollable">
                        <div className="form-row">
                            {/* Поле загрузки изображения */}
                            <div className="form-group image-upload-group">
                                <label htmlFor="image">Изображение продукта *</label>
                                <div className="image-upload-area">
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="image-input"
                                        disabled={loading}
                                    />
                                    {previewUrl ? (
                                        <div className="image-preview">
                                            <img src={previewUrl} alt="Preview" />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setPreviewUrl('');
                                                }}
                                                disabled={loading}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="image-placeholder">
                                            <span className="upload-icon">📁</span>
                                            <p>Нажмите для загрузки изображения</p>
                                            <small>PNG, JPG, JPEG (макс. 5MB)</small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Основная информация */}
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="name">Название продукта *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                        placeholder="Введите название продукта"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price">Цена (₽) *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        disabled={loading}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-row-small">
                                    <div className="form-group">
                                        <label htmlFor="rating">Рейтинг</label>
                                        <input
                                            type="number"
                                            id="rating"
                                            name="rating"
                                            value={formData.rating}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            disabled={loading}
                                            placeholder="0.0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="quantity">Количество</label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            min="0"
                                            disabled={loading}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="shortDescription">Краткое описание</label>
                            <textarea
                                id="shortDescription"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                rows="2"
                                disabled={loading}
                                placeholder="Краткое описание продукта"
                                maxLength="255"
                            />
                            <small>{formData.shortDescription.length}/255 символов</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="longDescription">Полное описание</label>
                            <textarea
                                id="longDescription"
                                name="longDescription"
                                value={formData.longDescription}
                                onChange={handleInputChange}
                                rows="3"
                                disabled={loading}
                                placeholder="Подробное описание продукта"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Добавление...
                                </>
                            ) : (
                                'Добавить продукт'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddProduct