import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API });

api.interceptors.request.use(cfg => {
    const token = sessionStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export default api;
