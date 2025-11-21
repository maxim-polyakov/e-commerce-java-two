import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getDescriptionByProductId, createDescription, updateDescription } from '../http/descriptionApi';
import './ProductDescription.css';

const ProductDescription = ({ productId, productName, isOpen, onClose, onDescriptionUpdated }) => {
    const [description, setDescription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        model: '',
        articleSku: '',
        dimensions: '',
        weight: '',
        colorFinish: '',
        powerConsumption: '',
        capacity: '',
        materials: '',
        warranty: '',
        countryOfOrigin: ''
    });

    useEffect(() => {
        if (isOpen && productId) {
            fetchDescription();
        }
    }, [isOpen, productId]);

    const fetchDescription = async () => {
        try {
            setLoading(true);
            setError(null);
            const desc = await getDescriptionByProductId(productId);
            setDescription(desc);

            if (desc) {
                setFormData({
                    model: desc.model || '',
                    articleSku: desc.articleSku || '',
                    dimensions: desc.dimensions || '',
                    weight: desc.weight || '',
                    colorFinish: desc.colorFinish || '',
                    powerConsumption: desc.powerConsumption || '',
                    capacity: desc.capacity || '',
                    materials: desc.materials || '',
                    warranty: desc.warranty || '',
                    countryOfOrigin: desc.countryOfOrigin || ''
                });
            } else {
                setFormData({
                    model: '',
                    articleSku: '',
                    dimensions: '',
                    weight: '',
                    colorFinish: '',
                    powerConsumption: '',
                    capacity: '',
                    materials: '',
                    warranty: '',
                    countryOfOrigin: ''
                });
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setDescription(null);
                setFormData({
                    model: '',
                    articleSku: '',
                    dimensions: '',
                    weight: '',
                    colorFinish: '',
                    powerConsumption: '',
                    capacity: '',
                    materials: '',
                    warranty: '',
                    countryOfOrigin: ''
                });
            } else if (err.response?.status === 403) {
                setError('Недостаточно прав для просмотра описаний. Требуется роль ADMIN.');
            } else {
                setError('Не удалось загрузить описание товара');
                console.error('Fetch description error:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);

            if (description) {
                await updateDescription(description.id, formData);
            } else {
                await createDescription(productId, formData);
            }

            if (onDescriptionUpdated) {
                onDescriptionUpdated();
            }

            onClose();

        } catch (err) {
            if (err.response?.status === 403) {
                setError('Недостаточно прав для сохранения описания. Требуется роль ADMIN.');
            } else {
                setError('Ошибка при сохранении описания: ' + (err.response?.data?.message || err.message));
            }
            console.error('Save description error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setError(null);
        setDescription(null);
        setFormData({
            model: '',
            articleSku: '',
            dimensions: '',
            weight: '',
            colorFinish: '',
            powerConsumption: '',
            capacity: '',
            materials: '',
            warranty: '',
            countryOfOrigin: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    // Создаем портал для рендера вне основного DOM дерева
    return createPortal(
        <div className="modal-overlay" onClick={handleClose}>
            <div className="description-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {description ? 'Редактировать описание' : 'Добавить описание'}
                    </h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="product-info">
                        <h3>Товар: {productName}</h3>
                        <p>ID: {productId}</p>
                    </div>

                    {loading && (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Загружаем описание...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {!loading && (
                        <form onSubmit={handleSubmit} className="description-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="model">Модель *</label>
                                    <input
                                        type="text"
                                        id="model"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Например: RB33J3200SA"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="articleSku">Артикул (SKU) *</label>
                                    <input
                                        type="text"
                                        id="articleSku"
                                        name="articleSku"
                                        value={formData.articleSku}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Например: SAMS-RB33J3200SA-2024"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dimensions">Габариты (В×Ш×Г)</label>
                                    <input
                                        type="text"
                                        id="dimensions"
                                        name="dimensions"
                                        value={formData.dimensions}
                                        onChange={handleInputChange}
                                        placeholder="Например: 178×60×63 см"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="weight">Вес</label>
                                    <input
                                        type="text"
                                        id="weight"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        placeholder="Например: 68 кг"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="colorFinish">Цвет/отделка</label>
                                    <input
                                        type="text"
                                        id="colorFinish"
                                        name="colorFinish"
                                        value={formData.colorFinish}
                                        onChange={handleInputChange}
                                        placeholder="Например: Нержавеющая сталь"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="powerConsumption">Мощность/потребление</label>
                                    <input
                                        type="text"
                                        id="powerConsumption"
                                        name="powerConsumption"
                                        value={formData.powerConsumption}
                                        onChange={handleInputChange}
                                        placeholder="Например: 120 кВтч/год, класс A++"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="capacity">Емкость/вместимость</label>
                                    <input
                                        type="text"
                                        id="capacity"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        placeholder="Например: 350 л"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="materials">Материалы изготовления</label>
                                    <textarea
                                        id="materials"
                                        name="materials"
                                        value={formData.materials}
                                        onChange={handleInputChange}
                                        placeholder="Например: Нержавеющая сталь, пластик ABS, стеклянные полки"
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="warranty">Гарантия</label>
                                    <input
                                        type="text"
                                        id="warranty"
                                        name="warranty"
                                        value={formData.warranty}
                                        onChange={handleInputChange}
                                        placeholder="Например: 2 года"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="countryOfOrigin">Страна производства</label>
                                    <input
                                        type="text"
                                        id="countryOfOrigin"
                                        name="countryOfOrigin"
                                        value={formData.countryOfOrigin}
                                        onChange={handleInputChange}
                                        placeholder="Например: Южная Корея"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleClose}
                                    disabled={saving}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            Сохранение...
                                        </>
                                    ) : (
                                        description ? 'Обновить описание' : 'Создать описание'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductDescription;