import axios from 'axios';

const api = axios.create({
    baseURL: '/', // Proxy handles the /api prefix in next.config.mjs
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor to handle token refresh or redirect on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
