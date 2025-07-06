import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logOut } from './auth';

const MAIN_API_URL = 'http://localhost:8000';

const baseAxiosInstance = axios.create({
  baseURL: MAIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

baseAxiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem('authToken');
    if (token && config.headers) {
        (config.headers as any).set?.('Authorization', `Bearer ${token}`);

        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

baseAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      window.alert('Network error. Please check your internet connection.');
    } else if (error.response.status === 401) {
      await logOut();
    }
    return Promise.reject(error);
  }
);

export async function getFromBaseApi<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseAxiosInstance.get<T>(url, {
    ...config,
    params,
  });
  return response.data;
}

export async function postToBaseApi<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseAxiosInstance.post<T>(url, data, config);
  return response.data;
}

export async function putToBaseApi<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseAxiosInstance.put<T>(url, data, config);
  return response.data;
}

export async function putFormBaseApi<T>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> {
  const formConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  };
  const response = await baseAxiosInstance.put<T>(url, formData, formConfig);
  return response.data;
}

export async function postFormBaseApi<T>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> {
  const formConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  };
  const response = await baseAxiosInstance.post<T>(url, formData, formConfig);
  return response.data;
}


export async function deleteFromBaseApi<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseAxiosInstance.delete<T>(url, config);
  return response.data;
}

export function getSocketData<T extends Record<string, any>>(url: string, params?: T): WebSocket {
  const protocol = MAIN_API_URL.startsWith('https') ? 'wss' : 'ws';
  const host = MAIN_API_URL.replace(/^https?:\/\//, '');
  const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return new WebSocket(`${protocol}://${host}/ws/${url}${queryString}`);
}
