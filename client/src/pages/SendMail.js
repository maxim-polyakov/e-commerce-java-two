import { Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LOGIN_ROUTE } from "../utils/consts.js";

const SendMail = () => {
    // Получаем email из localStorage или используем заглушку
    const userEmail = localStorage.getItem('registeredEmail') || 'вашу почту';

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
                            Мы отправили письмо с подтверждением на адрес:
                        </p>
                        <strong>{userEmail}</strong>
                    </div>

                    <p className="text-muted mb-4">
                        Пожалуйста, проверьте вашу почту и перейдите по ссылке в письме
                        для завершения регистрации. Если письмо не пришло, проверьте папку "Спам".
                    </p>

                    <Link to={LOGIN_ROUTE}>
                        <Button variant="success" size="lg">
                            Перейти к авторизации
                        </Button>
                    </Link>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SendMail;