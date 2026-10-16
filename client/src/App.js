import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { check } from "./http/authApi";
import { Spinner, Container } from "react-bootstrap";
import { Context } from "./index.js";
import AppRouter from "./components/AppRouter";
import LanguageSelector from "./components/LanguageSelector";
import { LocaleProvider } from "./i18n/LocaleContext";
import { ECOMMERCE_ROUTE } from "./utils/consts";

const GlobalLanguageSelector = () => {
    const { pathname } = useLocation();
    return pathname === ECOMMERCE_ROUTE
        ? null
        : <LanguageSelector className="language-selector-floating" />;
};

const App = observer(() => {
    const { user } = useContext(Context);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await check();
                if (userData) {
                    console.log("userData:", userData);
                    user.setUser(userData);
                    user.setIsAuth(true);
                } else {
                    user.setIsAuth(false);
                    user.setUser({});
                }
            } catch (error) {
                console.log("Auth check error:", error.message);
                user.setIsAuth(false);
                user.setUser({});
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [user]);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <BrowserRouter>
            <LocaleProvider>
                <GlobalLanguageSelector />
                <AppRouter />
            </LocaleProvider>
        </BrowserRouter>
    );
});

export default App;