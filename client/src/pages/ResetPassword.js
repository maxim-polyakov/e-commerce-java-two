import { useState, useEffect } from "react";
import { Container, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LOGIN_ROUTE } from "../utils/consts";
import { resetPassword } from "../http/userApi";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setError("Токен сброса пароля не найден");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация
        if (!password.trim() || !confirmPassword.trim()) {
            setError("Все поля должны быть заполнены");
            return;
        }

        if (password.length < 6) {
            setError("Пароль должен содержать минимум 6 символов");
            return;
        }

        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await resetPassword(token, password);

            setSuccess("Пароль успешно изменен! Теперь вы можете войти с новым паролем.");
            setLoading(false);

            // Автоматический переход через 3 секунды
            setTimeout(() => {
                navigate(LOGIN_ROUTE);
            }, 3000);

        } catch (error) {
            setError(error.message || "Произошла ошибка при смене пароля");
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ height: window.innerHeight - 54 }}
            >
                <Card style={{ width: 600 }} className="p-5 text-center">
                    <Card.Body>
                        <div className="mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>

                        <h2 className="mb-3">Неверная ссылка</h2>

                        <Alert variant="danger" className="mb-4">
                            {error || "Ссылка для сброса пароля недействительна или устарела."}
                        </Alert>

                        <p className="text-muted mb-4">
                            Пожалуйста, запросите новую ссылку для сброса пароля.
                        </p>

                        <Link to={LOGIN_ROUTE}>
                            <Button variant="primary">
                                Вернуться к авторизации
                            </Button>
                        </Link>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    if (success) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ height: window.innerHeight - 54 }}
            >
                <Card style={{ width: 600 }} className="p-5 text-center">
                    <Card.Body>
                        <div className="mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        </div>

                        <h2 className="mb-3">Пароль изменен!</h2>

                        <Alert variant="success" className="mb-4">
                            {success}
                        </Alert>

                        <p className="text-muted mb-4">
                            Вы будете автоматически перенаправлены на страницу авторизации через 3 секунды...
                        </p>

                        <Link to={LOGIN_ROUTE}>
                            <Button variant="success">
                                Перейти к авторизации
                            </Button>
                        </Link>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{ height: window.innerHeight - 54 }}
        >
            <Card style={{ width: 600 }} className="p-5">
                <Card.Body>
                    <h2 className="text-center mb-4">Создание нового пароля</h2>

                    {error && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}

                    <p className="text-muted mb-4 text-center">
                        Введите новый пароль для вашего аккаунта.
                    </p>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Новый пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Введите новый пароль"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                required
                                minLength={6}
                            />
                            <Form.Text className="text-muted">
                                Минимум 6 символов
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Подтвердите пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Повторите новый пароль"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex flex-column gap-3">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading || !password.trim() || !confirmPassword.trim()}
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Изменение...
                                    </>
                                ) : (
                                    "Изменить пароль"
                                )}
                            </Button>

                            <Link to={LOGIN_ROUTE}>
                                <Button variant="outline-secondary" className="w-100">
                                    Назад к авторизации
                                </Button>
                            </Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ResetPassword;