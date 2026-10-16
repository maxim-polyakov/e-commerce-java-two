import { LANGUAGES } from "./locale";
import { REQUIRED_TRANSLATION_KEYS, translations } from "./translations";
import previewLanguagePack from "../../previewLanguagePack.json";

describe("translations", () => {
    test("contains the complete 76-language pack", () => {
        expect(LANGUAGES).toHaveLength(76);
        expect(Object.keys(translations)).toHaveLength(76);
        expect(new Set(Object.keys(translations))).toEqual(new Set(LANGUAGES.map(({ code }) => code)));
    });

    test.each(LANGUAGES.map(({ code }) => code))("%s has every required non-empty key", (code) => {
        for (const key of REQUIRED_TRANSLATION_KEYS) {
            expect(typeof translations[code][key]).toBe("string");
            expect(translations[code][key].trim()).not.toBe("");
        }
    });

    test("keeps verified translations for representative scripts", () => {
        expect(translations.de.shopTitle).toBe("Online-Shop");
        expect(translations.de.username).toBe("Benutzername");
        expect(translations.de.firstName).toBe("Vorname");
        expect(translations.de.lastName).toBe("Nachname");
        expect(translations.de.orders).toBe("Kaufhistorie");
        expect(translations.de.orders).not.toContain("Befehle");
        expect(translations.ar.catalog).toBe("جميع المنتجات");
        expect(translations.ja.signInButton).toBe("ログイン");
        expect(translations.haw.profile).toBe("ʻAoʻao pilikino");
    });

    test("has complete localized link previews without placeholder leakage", () => {
        expect(Object.keys(previewLanguagePack.previews)).toHaveLength(76);

        LANGUAGES.forEach(({ code }) => {
            const preview = previewLanguagePack.previews[code];
            expect(preview.title).toContain("Baxic");
            expect(preview.title).not.toContain("__");
            expect(preview.description.trim()).not.toBe("");
            expect(preview.description).not.toContain("__");
        });
    });
});
