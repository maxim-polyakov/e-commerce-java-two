import { useContext, useState } from "react";
import { Button, Card, Container, Form, Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LOGIN_ROUTE, REGISTRATION_ROUTE } from "../utils/consts.js";
import { login, registration } from "../http/userApi.js";
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
        if (!email.trim() || !password.trim()) {
            setError("Email и пароль обязательны для заполнения");
            return;
        }

        // Для регистрации проверяем дополнительные поля
        if (!isLogin) {
            if (!username.trim() || !firstName.trim() || !lastName.trim()) {
                setError("Все поля должны быть заполнены");
                return;
            }
        }

        // Проверка валидности email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Введите корректный email адрес");
            return;
        }

        // Проверка длины пароля
        if (password.length < 6) {
            setError("Пароль должен содержать минимум 6 символов");
            return;
        }

        // Проверка username (только для регистрации)
        if (!isLogin && username.length < 3) {
            setError("Имя пользователя должно содержать минимум 3 символа");
            return;
        }

        try {
            setError(""); // Очищаем ошибки перед запросом

            let data;
            if (isLogin) {
                data = await login(email, password);
            } else {
                data = await registration(
                    email,
                    username,
                    firstName,
                    lastName,
                    password
                );
            }

            user.setUser(data);
            user.setIsAuth(true);

            setEmail("");
            setUsername("");
            setFirstName("");
            setLastName("");
            setPassword("");

            // Перенаправляем пользователя после успешной авторизации/регистрации
            navigate("/");

        } catch (error) {
            console.log("Ошибка авторизации:", error);
            // Просто используем message из ошибки, так как мы уже обработали её в API функциях
            setError(error.message);
        }
    };

    // Функция для проверки, активна ли кнопка
    const isButtonDisabled = () => {
        if (isLogin) {
            return !email.trim() || !password.trim();
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
                    <Form.Control
                        className="mt-3"
                        placeholder="Введите email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError(""); // Очищаем ошибку при изменении поля
                        }}
                        required
                    />

                    {/* Дополнительные поля только для регистрации */}
                    {!isLogin && (
                        <>
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