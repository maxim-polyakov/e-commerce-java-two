import Auth from "./pages/Auth";
import SendMail from "./pages/SendMail";
import VerifyEmail from "./pages/VerifyEmail"; // Добавьте этот импорт
import {
    LOGIN_ROUTE,
    REGISTRATION_ROUTE,
    SEND_MAIL
} from "./utils/consts";

export const publicRoutes = [
    {
        path: LOGIN_ROUTE,
        Component: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        Component: Auth
    },
    {
        path: SEND_MAIL,
        Component: SendMail
    },
    {
        path: "/auth/verify",
        Component: VerifyEmail
    }
];