import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getCurrentUser } from '../http/authApi';
import './UserProfile.css';

const UserProfile = observer(() => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (err) {
                setError('Не удалось загрузить информацию о пользователе');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка профиля...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
        </div>
    );

    if (!user) return null;

    return (
        <div className="user-profile">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="user-avatar">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="user-info">
                        <h2>{user.firstName} {user.lastName}</h2>
                        <p className="username">@{user.username}</p>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <span className="label">Email:</span>
                        <span className="value">
                            {user.email}
                            {user.emailVerified && (
                                <span className="verified-badge">✓ Подтвержден</span>
                            )}
                        </span>
                    </div>

                    <div className="detail-item">
                        <span className="label">ID пользователя:</span>
                        <span className="value">{user.id}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Имя:</span>
                        <span className="value">{user.firstName}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Фамилия:</span>
                        <span className="value">{user.lastName}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default UserProfile;