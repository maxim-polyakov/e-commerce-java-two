import Auth from "./pages/Auth";
import SendMail from "./pages/SendMail";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import {
    LOGIN_ROUTE,
    REGISTRATION_ROUTE,
    SEND_MAIL,
    VERIFY_EMAIL_ROUTE,
    FORGOT_PASSWORD_ROUTE,
    RESET_PASSWORD_ROUTE
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
        path: VERIFY_EMAIL_ROUTE,
        Component: VerifyEmail
    },
    {
        path: FORGOT_PASSWORD_ROUTE,
        Component: ForgotPassword
    },
    {
        path: RESET_PASSWORD_ROUTE,
        Component: ResetPassword
    }
];