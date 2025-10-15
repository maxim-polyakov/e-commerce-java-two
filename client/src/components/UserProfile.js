import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { getCurrentUser } from '../http/authApi';
import { Context } from '../index'; // Импортируем контекст
import './UserProfile.css';

const UserProfile = observer(() => {
    const { user } = useContext(Context);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setProfile(userData);
            } catch (err) {
                setError('Не удалось загрузить информацию о пользователе');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        user.setIsAuth(false);
    };

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

    if (!profile) return null;

    return (
        <div className="user-profile">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="user-avatar">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </div>
                    <div className="user-info">
                        <h2>{profile.firstName} {profile.lastName}</h2>
                        <p className="username">@{profile.username}</p>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <span className="label">Email:</span>
                        <span className="value">
                            {profile.email}
                            {profile.emailVerified && (
                                <span className="verified-badge">✓ Подтвержден</span>
                            )}
                        </span>
                    </div>

                    <div className="detail-item">
                        <span className="label">ID пользователя:</span>
                        <span className="value">{profile.id}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Имя:</span>
                        <span className="value">{profile.firstName}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Фамилия:</span>
                        <span className="value">{profile.lastName}</span>
                    </div>

                    {/* Статус аутентификации из контекста */}
                    <div className="detail-item">
                        <span className="label">Статус:</span>
                        <span className="value">
                            {user.isAuth ? (
                                <span className="auth-badge">✅ Авторизован</span>
                            ) : (
                                <span className="auth-badge-inactive">❌ Не авторизован</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Кнопка выхода */}
                <div className="profile-actions">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        disabled={!user.isAuth}
                    >
                        <span className="logout-icon">🚪</span>
                        Выйти из аккаунта
                    </button>
                </div>
            </div>
        </div>
    );
});

export default UserProfile;