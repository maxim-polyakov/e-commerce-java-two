import axios from "axios";

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

const $authhost = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

const authInterceptor = (config) => {
    console.log("API URL:", process.env.REACT_APP_API_URL);
    config.headers.authorization = `Bearer ${localStorage.getItem("token")}`;

    console.log(config);
    return config;
};

$authhost.interceptors.request.use(authInterceptor);

export { $host, $authhost };
