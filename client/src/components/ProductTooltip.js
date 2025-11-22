import React, { useState, useEffect } from 'react';
import './ProductTooltip.css';

const ProductTooltip = ({ product }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Автоматически закрываем тултип при монтировании
    useEffect(() => {
        console.log('🚫 Закрываем тултип при загрузке страницы товара');
        setIsVisible(false);
    }, []);

    console.log('🔧 ProductTooltip рендерится для:', product?.name);
    console.log('📋 Данные описания:', product?.description);
    console.log('👀 Видимость тултипа:', isVisible);

    if (!product || !product.description || !isVisible) {
        console.log('❌ Нет продукта, описания или тултип скрыт');
        return null;
    }

    const { description } = product;

    return (
        <div className="product-tooltip">
            <div className="tooltip-content">
                <div className="tooltip-header">
                    <h4>Ключевые характеристики</h4>
                    <div className="product-name">{product.name}</div>
                </div>

                <div className="tooltip-body">
                    <div className="tooltip-section">
                        <strong>Основные параметры:</strong>
                        <div className="tooltip-specs">
                            {description.model && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Модель:</span>
                                    <span className="spec-value">{description.model}</span>
                                </div>
                            )}
                            {description.countryOfOrigin && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Страна производства:</span>
                                    <span className="spec-value">{description.countryOfOrigin}</span>
                                </div>
                            )}
                            {description.dimensions && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Габариты:</span>
                                    <span className="spec-value">{description.dimensions}</span>
                                </div>
                            )}
                            {description.weight && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Вес:</span>
                                    <span className="spec-value">{description.weight}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="tooltip-section">
                        <strong>Технические характеристики:</strong>
                        <div className="tooltip-specs">
                            {description.powerConsumption && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Потребление:</span>
                                    <span className="spec-value">{description.powerConsumption}</span>
                                </div>
                            )}
                            {description.capacity && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Емкость:</span>
                                    <span className="spec-value">{description.capacity}</span>
                                </div>
                            )}
                            {description.colorFinish && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Цвет/отделка:</span>
                                    <span className="spec-value">{description.colorFinish}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="tooltip-section">
                        <strong>Дополнительно:</strong>
                        <div className="tooltip-specs">
                            {description.materials && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Материалы:</span>
                                    <span className="spec-value">{description.materials}</span>
                                </div>
                            )}
                            {description.warranty && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Гарантия:</span>
                                    <span className="spec-value">{description.warranty}</span>
                                </div>
                            )}
                            {description.articleSku && (
                                <div className="tooltip-spec">
                                    <span className="spec-label">Артикул:</span>
                                    <span className="spec-value">{description.articleSku}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductTooltip;