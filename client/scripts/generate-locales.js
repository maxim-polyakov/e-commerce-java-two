/* eslint-disable no-console */
const fs = require("fs");
const https = require("https");
const vm = require("vm");
const path = require("path");

const SOURCE_URL = "https://raw.githubusercontent.com/maxim-polyakov/Misa_bot/main/client/src/utils/translations.js";
const OUTPUT = path.join(__dirname, "..", "src", "i18n", "translations.js");
const PREVIEW_OUTPUT = path.join(__dirname, "..", "previewLanguagePack.json");
const SERVER_PREVIEW_OUTPUT = path.join(
    __dirname,
    "..",
    "..",
    "server",
    "src",
    "main",
    "resources",
    "ecommerce-previews.json",
);
const CUSTOM = {
    username: "Username",
    firstName: "First name",
    lastName: "Last name",
    usernamePasswordRequired: "Username and password are required",
    allFieldsRequired: "All fields are required",
    invalidEmail: "Enter a valid email address",
    passwordMin: "Password must contain at least 6 characters",
    usernameMin: "Username must contain at least 3 characters",
    oauthMissingData: "Google did not provide the required account data.",
    oauthError: "Google sign-in failed. Please try again later.",
    authError: "Sign-in failed. Check your details and try again.",
    shopTitle: "Online store",
    showcase: "Storefront",
    catalog: "All products",
    orders: "Purchase history",
    previewTitle: "Online Store",
    previewDescription: "Browse products and shop online.",
};

const get = (url) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            get(response.headers.location).then(resolve, reject);
            return;
        }
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => { body += chunk; });
        response.on("end", () => response.statusCode === 200
            ? resolve(body)
            : reject(new Error(`HTTP ${response.statusCode}: ${url}`)));
    }).on("error", reject);
});

const translate = async (code) => {
    if (code === "en") {
        return Object.fromEntries(Object.entries(CUSTOM).map(([key, value]) => [
            key,
            value.replaceAll("__BRAND__", "Baxic"),
        ]));
    }
    const target = code === "zh-TW" ? "zh-TW" : code;
    const query = encodeURIComponent(Object.values(CUSTOM).join("\n"));
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(target)}&q=${query}`;
    const payload = JSON.parse(await get(url));
    const values = payload[0].split(/\r?\n/);
    if (values.length !== Object.keys(CUSTOM).length) {
        throw new Error(`Unexpected translation count for ${code}: ${values.length}`);
    }
    return Object.fromEntries(Object.keys(CUSTOM).map((key, index) => [
        key,
        values[index].replaceAll("__BRAND__", "Baxic"),
    ]));
};

const run = async () => {
    const source = await get(SOURCE_URL);
    const executable = source
        .replace(/^import .*$/m, "")
        .replace("export const translations =", "globalThis.translations =")
        .replace(/\/\/ Fallback[\s\S]*$/, "");
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(executable, sandbox);

    const base = sandbox.translations;
    const result = {};
    for (const code of Object.keys(base)) {
        console.log(`Translating ${code}`);
        result[code] = {
            language: base[code].language,
            profile: base[code].profile,
            logout: base[code].logout,
            loading: base[code].shareChatLoading,
            signIn: base[code].authSignIn,
            registration: base[code].authRegistration,
            email: base[code].authPlaceholderEmail,
            password: base[code].authPlaceholderPassword,
            google: base[code].authSignInWithGoogle,
            noAccount: base[code].authNoAccount,
            alreadyAccount: base[code].authAlreadyHaveAccount,
            signInButton: base[code].authSignInButton,
            registerButton: base[code].authRegisterButton,
            forgotPassword: base[code].authForgotPasswordLink,
            ...await translate(code),
        };
        result[code].previewTitle = `Baxic — ${result[code].previewTitle}`;
        if (code === "haw") result[code].showcase = "Kahua";
    }

    const contents = `// Generated from Misa_bot translations plus commerce-specific translations.\n`
        + `// Run: node scripts/generate-locales.js\n`
        + `export const translations = ${JSON.stringify(result, null, 4)};\n\n`
        + `export const REQUIRED_TRANSLATION_KEYS = ${JSON.stringify(Object.keys(result.en), null, 4)};\n`;
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, contents, "utf8");
    const previewContents = JSON.stringify({
        previews: Object.fromEntries(Object.entries(result).map(([code, messages]) => [
            code,
            {
                title: messages.previewTitle,
                description: messages.previewDescription,
            },
        ])),
    }, null, 2) + "\n";
    fs.writeFileSync(PREVIEW_OUTPUT, previewContents, "utf8");
    fs.mkdirSync(path.dirname(SERVER_PREVIEW_OUTPUT), { recursive: true });
    fs.writeFileSync(SERVER_PREVIEW_OUTPUT, previewContents, "utf8");
    console.log(`Wrote ${OUTPUT}`);
    console.log(`Wrote ${PREVIEW_OUTPUT}`);
    console.log(`Wrote ${SERVER_PREVIEW_OUTPUT}`);
};

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
