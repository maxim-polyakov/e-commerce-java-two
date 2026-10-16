import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { applyDocumentLanguage, normalizeLanguage, resolveLanguage, STORAGE_KEY, withLang } from "./locale";
import { translations } from "./translations";

const LocaleContext = createContext(null);

export const LocaleProvider = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [language, setLanguageState] = useState(() => resolveLanguage());

    useEffect(() => {
        const resolved = resolveLanguage({ search: location.search });
        setLanguageState((current) => current === resolved ? current : resolved);
    }, [location.search]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
        applyDocumentLanguage(language);
        document.title = translations[language].previewTitle;
        const urlLanguage = normalizeLanguage(new URLSearchParams(location.search).get("lang"));
        if (!urlLanguage) {
            navigate(withLang(`${location.pathname}${location.search}${location.hash}`, language), { replace: true });
        }
    }, [language, location.pathname, location.search, location.hash, navigate]);

    const setLanguage = useCallback((code) => {
        localStorage.setItem(STORAGE_KEY, code);
        setLanguageState(code);
        navigate(withLang(`${location.pathname}${location.search}${location.hash}`, code), { replace: true });
    }, [location.pathname, location.search, location.hash, navigate]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        t: (key) => translations[language][key],
        localize: (destination) => withLang(destination, language),
    }), [language, setLanguage]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) throw new Error("useLocale must be used inside LocaleProvider");
    return context;
};
