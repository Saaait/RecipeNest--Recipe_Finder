import axios from "axios";

// Create an axios instance with base URL
const API_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 second timeout to prevent indefinite loading
    timeoutErrorMessage: "Request timed out. Please check your connection and try again."
});

// Automatically add access token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem("accessToken"); // get token from storage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // attach token to request
    }
    return config;
});

// Automatically refresh token if access token expires
api.interceptors.response.use(
    response => response, // if response is ok, just return it
    async error => {
        const originalRequest = error.config;

        // if token expired and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // mark request as retried

            const refreshToken = localStorage.getItem("refreshToken"); // get refresh token
            if (!refreshToken) return Promise.reject(error); // no token? fail

            try {
                // call refresh endpoint to get new tokens
                const res = await axios.post(`${API_URL}/api/users/refresh`, {
                    token: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = res.data;

                // save new tokens
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", newRefreshToken);

                // retry original request with new access token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axios(originalRequest);
            } catch (err) {
                // if refresh fails, logout user
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
