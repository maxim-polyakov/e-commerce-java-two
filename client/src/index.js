import {createContext} from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import UserEcommerce from "./store/UserEcommerce.js";
import App from './App.js';

export const Context = createContext(null)

const root = ReactDOM.createRoot(document.getElementById('root'))
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

root.render(
    googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
            <Context.Provider value={{ user: new UserEcommerce() }}>
                <App />
            </Context.Provider>
        </GoogleOAuthProvider>
    ) : (
        <Context.Provider value={{ user: new UserEcommerce() }}>
            <App />
        </Context.Provider>
    )
);
