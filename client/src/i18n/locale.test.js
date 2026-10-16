import { normalizeLanguage, resolveLanguage, withLang } from "./locale";

describe("locale URL behavior", () => {
    test("uses URL before storage and browser language", () => {
        expect(resolveLanguage({
            search: "?page=2&lang=ja",
            stored: "de",
            browser: "ar-SA",
        })).toBe("ja");
    });

    test("falls through storage, browser, and English", () => {
        expect(resolveLanguage({ search: "", stored: "de-DE", browser: "ja-JP" })).toBe("de");
        expect(resolveLanguage({ search: "", stored: "unsupported", browser: "ar-SA" })).toBe("ar");
        expect(resolveLanguage({ search: "", stored: null, browser: "xx-ZZ" })).toBe("en");
    });

    test("normalizes regional and Chinese variants", () => {
        expect(normalizeLanguage("pt-BR")).toBe("pt");
        expect(normalizeLanguage("zh-Hant-TW")).toBe("zh-TW");
        expect(normalizeLanguage("zh-CN")).toBe("zh");
    });

    test("preserves route query, hash, and navigation state", () => {
        expect(withLang("/product/7?tab=details#reviews", "haw")).toEqual({
            pathname: "/product/7",
            search: "?tab=details&lang=haw",
            hash: "#reviews",
        });
        expect(withLang({ pathname: "/shop", search: "?page=3", state: { tab: "catalog" } }, "de"))
            .toEqual({
                pathname: "/shop",
                search: "?page=3&lang=de",
                hash: "",
                state: { tab: "catalog" },
            });
    });
});
