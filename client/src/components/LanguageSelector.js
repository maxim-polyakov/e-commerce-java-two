import { LANGUAGES } from "../i18n/locale";
import { useLocale } from "../i18n/LocaleContext";
import "./LanguageSelector.css";

const LanguageSelector = ({ className = "", navigation = false }) => {
    const { language, setLanguage, t } = useLocale();

    return (
        <label
            className={`language-selector ${navigation ? "nav-btn language-selector-nav" : ""} ${className}`.trim()}
        >
            <span className="visually-hidden">{t("language")}</span>
            <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label={t("language")}
            >
                {LANGUAGES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                ))}
            </select>
        </label>
    );
};

export default LanguageSelector;
