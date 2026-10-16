import { Form } from "react-bootstrap";
import { LANGUAGES } from "../i18n/locale";
import { useLocale } from "../i18n/LocaleContext";
import "./LanguageSelector.css";

const LanguageSelector = ({ className = "" }) => {
    const { language, setLanguage, t } = useLocale();

    return (
        <label className={`language-selector ${className}`.trim()}>
            <span className="visually-hidden">{t("language")}</span>
            <span aria-hidden="true">🌐</span>
            <Form.Select
                size="sm"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label={t("language")}
            >
                {LANGUAGES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                ))}
            </Form.Select>
        </label>
    );
};

export default LanguageSelector;
