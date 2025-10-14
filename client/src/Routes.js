import Auth from "./pages/Auth";
import {
    LOGIN_ROUTE,
    REGISTRATION_ROUTE
} from "./utils/consts";

export const publicRoutes = [ // Исправлено: publicRoutes вместо publickRoutes
    {
        path: LOGIN_ROUTE,
        Component: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        Component: Auth
    }
];