import { useState, useEffect, useContext } from "react";
import { Container, Card, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { verifyEmail } from "../http/authApi"; // Импортируем метод
import { LOGIN_ROUTE } from "../utils/consts";

const VerifyEmail = observer(() => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { user } = useContext(Context);

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyUserEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Токен верификации не найден');
                return;
            }

            try {
                // Используем axios метод вместо fetch
                const data = await verifyEmail(token.toString());

                setStatus('success');
                setMessage(data.message || 'Email успешно подтвержден! Теперь вы можете войти в систему.');

                // Обновляем статус пользователя если он авторизован
                if (user.isAuth) {
                    // Можно обновить данные пользователя
                }
            } catch (error) {
                console.error('Ошибка верификации:', error);
                setStatus('error');
                setMessage(error.message || 'Произошла ошибка при проверке email');
            }
        };

        verifyUserEmail();
    }, [token, user]);

    const handleGoToLogin = () => {
        navigate(LOGIN_ROUTE);
    };

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{ height: window.innerHeight - 54 }}
        >
            <Card style={{ width: 600 }} className="p-5 text-center">
                <Card.Body>
                    {/* Иконка в зависимости от статуса */}
                    <div className="mb-4">
                        {status === 'loading' && (
                            <Spinner animation="border" variant="primary" />
                        )}
                        {status === 'success' && (
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        )}
                        {status === 'error' && (
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        )}
                    </div>

                    <h2 className="mb-3">
                        {status === 'loading' && 'Проверка email...'}
                        {status === 'success' && 'Email подтвержден!'}
                        {status === 'error' && 'Ошибка верификации'}
                    </h2>

                    {status === 'loading' && (
                        <p className="text-muted mb-4">
                            Проверяем ваш email...
                        </p>
                    )}

                    {message && (
                        <Alert
                            variant={
                                status === 'success' ? 'success' :
                                    status === 'error' ? 'danger' : 'info'
                            }
                            className="mb-4"
                        >
                            {message}
                        </Alert>
                    )}

                    {/* Дополнительная информация */}
                    {status === 'success' && (
                        <p className="text-muted mb-4">
                            Ваш email был успешно подтвержден. Теперь вы можете войти в систему
                            и использовать все возможности приложения.
                        </p>
                    )}

                    {status === 'error' && (
                        <p className="text-muted mb-4">
                            Если проблема повторяется, попробуйте запросить новое письмо
                            для подтверждения или обратитесь в поддержку.
                        </p>
                    )}

                    {/* Кнопки действий */}
                    <div className="d-flex flex-column gap-3">
                        {status === 'success' && (
                            <Button
                                variant="success"
                                size="lg"
                                onClick={handleGoToLogin}
                            >
                                Перейти к авторизации
                            </Button>
                        )}

                        {status === 'error' && (
                            <>
                                <Button
                                    variant="primary"
                                    onClick={handleGoToLogin}
                                >
                                    Перейти к авторизации
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => window.location.reload()}
                                >
                                    Попробовать снова
                                </Button>
                            </>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
});

export default VerifyEmail;