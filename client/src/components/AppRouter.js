import { Context } from "../index.js";
import { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { authRoutes, publicRoutes } from "../Routes.js";
import { observer } from "mobx-react-lite";
import Ecommerce from "../pages/Ecommerce.js";
import { LOGIN_ROUTE} from "../utils/consts.js";

const AppRouter = observer(() => {
    const { user } = useContext(Context);
    const isAuth = user?.isAuth;

    console.log("User auth status:", user?.isAuth);

    return (
        <Routes>
            {isAuth &&
                authRoutes.map(({ path, Component }) => (
                    <Route
                        key={path}
                        path={path}
                        element={<Component />}
                    />
                ))}

            {publicRoutes.map(({ path, Component }) => (
                <Route
                    key={path}
                    path={path}
                    element={<Component />}
                />
            ))}

            <Route
                path="/"
                element={<Navigate to={LOGIN_ROUTE} replace />}
            />

            <Route
                path="*"
                element={
                    isAuth ?
                        <Ecommerce /> :
                        <Navigate to={LOGIN_ROUTE} replace />
                }
            />
        </Routes>
    );
});

export default AppRouter;