import { useState } from "react";
import { Container, Card, Button, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LOGIN_ROUTE } from "../utils/consts";
import { sendPasswordResetEmail } from "../http/authApi"; // Добавьте этот импорт

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Введите email адрес");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Введите корректный email адрес");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // ЗАМЕНИТЕ имитацию на реальный вызов API
            await sendPasswordResetEmail(email);

            setIsSubmitted(true);
            setLoading(false);

        } catch (error) {
            setError(error.message || "Произошла ошибка при отправке письма");
            setLoading(false);
        }
    };

    // Остальная часть компонента без изменений
    if (isSubmitted) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ height: window.innerHeight - 54 }}
            >
                <Card style={{ width: 600 }} className="p-5 text-center">
                    <Card.Body>
                        {/* Иконка письма */}
                        <div className="mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>

                        <h2 className="mb-3">Письмо отправлено!</h2>

                        <div className="alert alert-info mb-4">
                            <p className="mb-2">
                                Мы отправили письмо с инструкциями по восстановлению пароля на адрес:
                            </p>
                            <strong>{email}</strong>
                        </div>

                        <p className="text-muted mb-4">
                            Пожалуйста, проверьте вашу почту и перейдите по ссылке в письме
                            для создания нового пароля. Если письмо не пришло, проверьте папку "Спам".
                        </p>

                        <div className="d-flex flex-column gap-3">
                            <Link to={LOGIN_ROUTE}>
                                <Button variant="success" size="lg">
                                    Вернуться к авторизации
                                </Button>
                            </Link>

                        </div>
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
                    <h2 className="text-center mb-4">Восстановление пароля</h2>

                    {error && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}

                    <p className="text-muted mb-4 text-center">
                        Введите email, указанный при регистрации, и мы вышлем вам
                        инструкции для восстановления пароля.
                    </p>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label>Email адрес</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Введите ваш email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex flex-column gap-3">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading || !email.trim()}
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Отправка...
                                    </>
                                ) : (
                                    "Отправить инструкции"
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

export default ForgotPassword;