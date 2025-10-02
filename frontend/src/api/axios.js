import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const publicApi = axios.create({
  baseURL: API_URL + '/api',
});

const privateApi = axios.create({
  baseURL: API_URL + '/api',
});

privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  console.log('API Base URL:', config.baseURL);
  console.log('Token present:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

privateApi.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export { publicApi, privateApi };
