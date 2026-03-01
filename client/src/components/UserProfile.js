import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { getCurrentUser } from '../http/authApi';
import { getUserAddresses, addUserAddress, updateUserAddress } from '../http/userApi';
import { Context } from '../index';
import './UserProfile.css';

const UserProfile = observer(() => {
    const { user } = useContext(Context);
    const [profile, setProfile] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addressLoading, setAddressLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addressError, setAddressError] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const [addressForm, setAddressForm] = useState({
        addressLine: '',
        city: '',
        country: '',
        isDefault: false
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getCurrentUser();
                console.log("User data received:", userData);
                setProfile(userData);

                // Загружаем адреса пользователя
                await fetchUserAddresses(userData.id);
            } catch (err) {
                console.error("Error fetching user:", err);
                setError('Не удалось загрузить информацию о пользователе');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchUserAddresses = async (userId) => {
        try {
            setAddressLoading(true);
            console.log("Fetching addresses for user:", userId);
            const addressesData = await getUserAddresses(userId);
            console.log("Addresses received:", addressesData);
            setAddresses(addressesData);
            setAddressError(null);
        } catch (err) {
            console.error("Error fetching addresses:", err);
            setAddressError(err.message || 'Не удалось загрузить адреса доставки');
        } finally {
            setAddressLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        if (!profile) {
            setAddressError("Профиль пользователя не загружен");
            return;
        }

        try {
            setAddressError(null);
            console.log("Submitting address form:", addressForm);

            if (editingAddress) {
                // Редактирование адреса
                console.log("Updating address:", editingAddress.id);
                await updateUserAddress(profile.id, editingAddress.id, addressForm);
            } else {
                // Добавление нового адреса
                console.log("Adding new address for user:", profile.id);
                await addUserAddress(profile.id, addressForm);
            }

            // Обновляем список адресов
            await fetchUserAddresses(profile.id);

            // Сбрасываем форму
            setAddressForm({
                addressLine: '',
                city: '',
                country: '',
            });
            setShowAddressForm(false);
            setEditingAddress(null);

        } catch (err) {
            console.error("Error in address submission:", err);
            setAddressError(err.message || 'Ошибка при сохранении адреса');
        }
    };

    const handleEditAddress = (address) => {
        console.log("Editing address:", address);
        setEditingAddress(address);
        setAddressForm({
            addressLine: address.addressLine || '',
            city: address.city || '',
            country: address.country || '',
        });
        setShowAddressForm(true);
    };

    const handleCancelEdit = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
            addressLine: '',
            city: '',
            country: '',
        });
        setAddressError(null);
    };

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
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Аватар" className="user-avatar-img" referrerPolicy="no-referrer" />
                        ) : (
                            `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`
                        )}
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

                {/* Секция адресов доставки */}
                <div className="addresses-section">
                    <div className="section-header">
                        <h3>Адреса доставки</h3>
                        <button
                            className="btn-add-address"
                            onClick={() => setShowAddressForm(true)}
                            disabled={addressLoading}
                        >
                            + Добавить адрес
                        </button>
                    </div>

                    {addressError && (
                        <div className="error-message">{addressError}</div>
                    )}

                    {showAddressForm && (
                        <div className="address-form">
                            <h4>{editingAddress ? 'Редактировать адрес' : 'Добавить новый адрес'}</h4>
                            <form onSubmit={handleAddressSubmit}>
                                <div className="form-group">
                                    <label>Адрес:</label>
                                    <input
                                        type="text"
                                        value={addressForm.addressLine}
                                        onChange={(e) => setAddressForm({...addressForm, addressLine: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Город:</label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Страна:</label>
                                    <input
                                        type="text"
                                        value={addressForm.country}
                                        onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-save">
                                        {editingAddress ? 'Сохранить' : 'Добавить'}
                                    </button>
                                    <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {addressLoading ? (
                        <div className="loading-addresses">Загрузка адресов...</div>
                    ) : (
                        <div className="addresses-list">
                            {addresses.length === 0 ? (
                                <p className="no-addresses">Адреса доставки не добавлены</p>
                            ) : (
                                addresses.map((address) => (
                                    <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                                                                                <div className="address-content">
                                            <p><strong>Адрес:</strong> {address.addressLine}</p>
                                            <p><strong>Город:</strong> {address.city}</p>
                                            <p><strong>Страна:</strong> {address.country}</p>
                                        </div>
                                        <div className="address-actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditAddress(address)}
                                            >
                                                Редактировать
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
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