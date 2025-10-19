import { useContext, useState } from "react";
import { Button, Card, Container, Form, Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LOGIN_ROUTE, REGISTRATION_ROUTE, SEND_MAIL, FORGOT_PASSWORD_ROUTE, ECOMMERCE_ROUTE } from "../utils/consts.js";
import { login, registration } from "../http/authApi.js";
import { observer } from "mobx-react-lite";
import { Context } from "../index.js";
import './Auth.css';

const Auth = observer(() => {
    const { user } = useContext(Context);
    const location = useLocation();
    const isLogin = location.pathname === LOGIN_ROUTE && true;
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const swapMethod = () => {
        setEmail("");
        setUsername("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setError("");
    };

    const signIn = async () => {
        if (isLogin) {
            if (!username.trim() || !password.trim()) {
                setError("Имя пользователя и пароль обязательны для заполнения");
                return;
            }
        } else {
            if (!email.trim() || !username.trim() || !firstName.trim() || !lastName.trim() || !password.trim()) {
                setError("Все поля должны быть заполнены");
                return;
            }
        }

        if (!isLogin) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError("Введите корректный email адрес");
                return;
            }
        }

        if (password.length < 6) {
            setError("Пароль должен содержать минимум 6 символов");
            return;
        }

        if (username.length < 3) {
            setError("Имя пользователя должно содержать минимум 3 символа");
            return;
        }

        try {
            setError("");

            let data;
            if (isLogin) {
                data = await login(username, password);
                user.setUser(data);
                user.setIsAuth(true);
                swapMethod();
                navigate(ECOMMERCE_ROUTE);
            } else {
                await registration(
                    email,
                    username,
                    firstName,
                    lastName,
                    password
                );
                localStorage.setItem('registeredEmail', email);
                swapMethod();
                navigate(SEND_MAIL);
            }

        } catch (error) {
            console.log("Ошибка авторизации:", error);
            setError(error.message);
        }
    };

    const isButtonDisabled = () => {
        if (isLogin) {
            return !username.trim() || !password.trim();
        } else {
            return !email.trim() || !username.trim() || !firstName.trim() || !lastName.trim() || !password.trim();
        }
    };

    return (
        <Container
            className="d-flex justify-content-center align-items-center auth-container"
            style={{ height: window.innerHeight - 54 }}
        >
            <Card style={{ width: 700 }} className="p-5 auth-card">
                <h2 className="m-auto text-center auth-title">
                    {isLogin ? "Авторизация" : "Регистрация"}
                </h2>

                {error && (
                    <Alert variant="danger" className="mt-3 auth-alert">
                        {error}
                    </Alert>
                )}

                <Form className="d-flex flex-column auth-form">
                    {isLogin ? (
                        <Form.Control
                            className="mt-3"
                            placeholder="Введите имя пользователя"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError("");
                            }}
                            required
                        />
                    ) : (
                        <>
                            <Form.Control
                                className="mt-3"
                                placeholder="Введите email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <Form.Control
                                className="mt-2"
                                placeholder="Введите имя пользователя"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                        </>
                    )}

                    {!isLogin && (
                        <>
                            <Form.Control
                                className="mt-2"
                                placeholder="Введите имя"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <Form.Control
                                className="mt-2"
                                placeholder="Введите фамилию"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                        </>
                    )}

                    <Form.Control
                        className="mt-2"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                        type="password"
                        required
                    />

                    {isLogin && (
                        <div className="mt-2 text-end">
                            <Link
                                to={FORGOT_PASSWORD_ROUTE}
                                className="forgot-password-link"
                            >
                                Забыли пароль?
                            </Link>
                        </div>
                    )}

                    <div className="d-flex justify-content-between mt-3 pl-3 pr-3 align-items-center">
                        <div className="auth-switch-text">
                            {isLogin ? (
                                <>
                                    Нет аккаунта?
                                    <Link
                                        to={REGISTRATION_ROUTE}
                                        className="auth-switch-link"
                                        onClick={() => swapMethod()}
                                    >
                                        {" "}
                                        Регистрация
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Уже есть аккаунт?
                                    <Link
                                        to={LOGIN_ROUTE}
                                        className="auth-switch-link"
                                        onClick={() => swapMethod()}
                                    >
                                        {" "}
                                        Войти
                                    </Link>
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline-success"
                            onClick={signIn}
                            disabled={isButtonDisabled()}
                            className="auth-btn"
                        >
                            {isLogin ? "Войти" : "Зарегистрироваться"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
});

export default Auth;