import { useContext, useState, useEffect, useRef } from "react";
import { Button, Card, Container, Form, Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LOGIN_ROUTE, REGISTRATION_ROUTE, SEND_MAIL, FORGOT_PASSWORD_ROUTE, ECOMMERCE_ROUTE } from "../utils/consts.js";
import { login, exchangeOAuthCode, registration } from "../http/authApi.js";
import { observer } from "mobx-react-lite";
import { Context } from "../index.js";
import { useLocale } from "../i18n/LocaleContext";
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const Auth = observer(() => {
    const { user } = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const oauthHandled = useRef(false);
    const isLogin = location.pathname === LOGIN_ROUTE && true;
    const { language, localize, t } = useLocale();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const oauthError = searchParams.get('oauth_error');
        if (oauthError) {
            const messages = {
                OAUTH_MISSING_DATA: t("oauthMissingData"),
                OAUTH_AUTH_ERROR: t("oauthError"),
            };
            setError(messages[oauthError] || t("oauthError"));
            setSearchParams({ lang: language }, { replace: true });
            return;
        }

        const code = searchParams.get('code');
        if (!code || searchParams.get('oauth') !== 'google' || oauthHandled.current) return;

        oauthHandled.current = true;
        setError('');
        exchangeOAuthCode(code)
            .then((data) => {
                user.setUser(data);
                user.setIsAuth(true);
                swapMethod();
                navigate(localize(ECOMMERCE_ROUTE));
            })
            .catch((err) => {
                oauthHandled.current = false;
                setError(err.message || t("oauthError"));
                setSearchParams({ lang: language }, { replace: true });
            });
    }, [searchParams, navigate, setSearchParams, user, language, localize, t]);

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
                setError(t("usernamePasswordRequired"));
                return;
            }
        } else {
            if (!email.trim() || !username.trim() || !firstName.trim() || !lastName.trim() || !password.trim()) {
                setError(t("allFieldsRequired"));
                return;
            }
        }

        if (!isLogin) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError(t("invalidEmail"));
                return;
            }
        }

        if (password.length < 6) {
            setError(t("passwordMin"));
            return;
        }

        if (username.length < 3) {
            setError(t("usernameMin"));
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
                navigate(localize(ECOMMERCE_ROUTE));
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
                navigate(localize(SEND_MAIL));
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
                    {isLogin ? t("signIn") : t("registration")}
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
                            placeholder={t("username")}
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
                                placeholder={t("email")}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <Form.Control
                                className="mt-2"
                                placeholder={t("username")}
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
                                placeholder={t("firstName")}
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                            <Form.Control
                                className="mt-2"
                                placeholder={t("lastName")}
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
                        placeholder={t("password")}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                        type="password"
                        required
                    />

                    {API_URL && (
                        <div className="mt-3 d-flex justify-content-center">
                            <a
                                href={`${API_URL}/oauth2/authorization/google`}
                                className="btn btn-outline-secondary btn-lg"
                                style={{ textDecoration: 'none' }}
                            >
                                {t("google")}
                            </a>
                        </div>
                    )}

                    {isLogin && (
                        <div className="mt-2 text-end">
                            <Link
                                to={localize(FORGOT_PASSWORD_ROUTE)}
                                className="forgot-password-link"
                            >
                                {t("forgotPassword")}
                            </Link>
                        </div>
                    )}

                    <div className="d-flex justify-content-between mt-3 pl-3 pr-3 align-items-center">
                        <div className="auth-switch-text">
                            {isLogin ? (
                                <>
                                    {t("noAccount")}
                                    <Link
                                        to={localize(REGISTRATION_ROUTE)}
                                        className="auth-switch-link"
                                        onClick={() => swapMethod()}
                                    >
                                        {" "}
                                        {t("registration")}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {t("alreadyAccount")}
                                    <Link
                                        to={localize(LOGIN_ROUTE)}
                                        className="auth-switch-link"
                                        onClick={() => swapMethod()}
                                    >
                                        {" "}
                                        {t("signInButton")}
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
                            {isLogin ? t("signInButton") : t("registerButton")}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
});

export default Auth;