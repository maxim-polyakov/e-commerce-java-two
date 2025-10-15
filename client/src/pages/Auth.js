import { useContext, useState } from "react";
import { Button, Card, Container, Form, Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LOGIN_ROUTE, REGISTRATION_ROUTE, SEND_MAIL, FORGOT_PASSWORD_ROUTE, ECOMMERCE_ROUTE } from "../utils/consts.js";
import { login, registration } from "../http/authApi.js";
import { observer } from "mobx-react-lite";
import { Context } from "../index.js";

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
    const [error, setError] = useState(""); // Состояние для ошибок

    const swapMethod = () => {
        setEmail("");
        setUsername("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setError(""); // Очищаем ошибки при смене формы
    };

    const signIn = async () => {
        // Проверка на пустые поля
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

        // Для регистрации проверяем валидность email
        if (!isLogin) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError("Введите корректный email адрес");
                return;
            }
        }

        // Проверка длины пароля
        if (password.length < 6) {
            setError("Пароль должен содержать минимум 6 символов");
            return;
        }

        // Проверка username
        if (username.length < 3) {
            setError("Имя пользователя должно содержать минимум 3 символа");
            return;
        }

        try {
            setError(""); // Очищаем ошибки перед запросом

            let data;
            if (isLogin) {
                data = await login(username, password);
                user.setUser(data);
                user.setIsAuth(true);

                swapMethod();
                navigate(ECOMMERCE_ROUTE); // Изменено: перенаправляем на ECOMMERCE_ROUTE
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
                navigate(SEND_MAIL); // Перенаправляем на страницу подтверждения
            }

        } catch (error) {
            console.log("Ошибка авторизации:", error);
            // Просто используем message из ошибки, так как мы уже обработали её в API функциях
            setError(error.message);
        }
    };

    // Функция для проверки, активна ли кнопка
    const isButtonDisabled = () => {
        if (isLogin) {
            return !username.trim() || !password.trim();
        } else {
            return !email.trim() || !username.trim() || !firstName.trim() || !lastName.trim() || !password.trim();
        }
    };

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{ height: window.innerHeight - 54 }}
        >
            <Card style={{ width: 700 }} className="p-5">
                <h2 className="m-auto text-center">
                    {isLogin ? "Авторизация" : "Регистрация"}
                </h2>

                {/* Отображение ошибок */}
                {error && (
                    <Alert variant="danger" className="mt-3">
                        {error}
                    </Alert>
                )}

                <Form className="d-flex flex-column">
                    {/* Для логина показываем поле username, для регистрации - оба поля */}
                    {isLogin ? (
                        <Form.Control
                            className="mt-3"
                            placeholder="Введите имя пользователя"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError(""); // Очищаем ошибку при изменении поля
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

                    {/* Дополнительные поля только для регистрации */}
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
                            setError(""); // Очищаем ошибку при изменении поля
                        }}
                        type="password"
                        required
                    />

                    {/* Кнопка "Забыл пароль" только для страницы логина */}
                    {isLogin && (
                        <div className="mt-2 text-end">
                            <Link
                                to={FORGOT_PASSWORD_ROUTE}
                                style={{
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    color: "#6c757d"
                                }}
                            >
                                Забыли пароль?
                            </Link>
                        </div>
                    )}

                    <div className="d-flex justify-content-between mt-3 pl-3 pr-3 align-items-center">
                        <div>
                            {isLogin ? (
                                <>
                                    Нет аккаунта?
                                    <Link
                                        to={REGISTRATION_ROUTE}
                                        style={{ textDecoration: "none" }}
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
                                        style={{ textDecoration: "none" }}
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
                            disabled={isButtonDisabled()} // Кнопка неактивна при пустых полях
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