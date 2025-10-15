import { Context } from "../index.js";
import { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { publicRoutes } from "../Routes.js";
import { observer } from "mobx-react-lite";
import { LOGIN_ROUTE} from "../utils/consts.js";

const AppRouter = observer(() => {
    const { user } = useContext(Context);
    const isAuth = user?.isAuth;

    console.log("User auth status:", user?.isAuth);

    return (
        <Routes>
            {/* Публичные маршруты - доступны всем */}
            {publicRoutes.map(({ path, Component }) => (
                <Route
                    key={path}
                    path={path}
                    element={<Component />}
                />
            ))}

            {/* КОРНЕВОЙ ПУТЬ - ВСЕГДА перенаправляем на логин */}
            <Route
                path="/"
                element={<Navigate to={LOGIN_ROUTE} replace />}
            />
        </Routes>
    );
});

export default AppRouter;