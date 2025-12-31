import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const defaultConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

interface HttpServiceConfig extends AxiosRequestConfig {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  url: string;
  data?: unknown;
  onSuccess?: (response: AxiosResponse) => void;
  onError?: (error: unknown) => void;
}

const createAxiosInstance = (config: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create(config);

  // Request interceptor: Add JWT token to all requests
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('mad-wallet-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: Handle 401 errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - clear auth and redirect to login
        localStorage.removeItem('mad-wallet-token');
        localStorage.removeItem('mad-wallet-user');

        // Only redirect if not already on login/signup page
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/signup')
        ) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

const httpService = <T = unknown>(
  config: HttpServiceConfig & { overrides?: Partial<AxiosRequestConfig>; label?: string },
): Promise<AxiosResponse<T>> => {
  const { method, url, data, overrides, onSuccess, onError, label, ...restConfig } = config;

  const mergedConfig: AxiosRequestConfig = {
    ...defaultConfig,
    ...restConfig,
    ...(overrides && overrides),
  };

  const instance = createAxiosInstance(mergedConfig);
  let action = 'Fetch';

  const executeRequest = async (): Promise<AxiosResponse<T>> => {
    try {
      let response: AxiosResponse<T>;

      switch (method) {
        case 'get':
          response = await instance.get<T>(url, { ...mergedConfig });
          break;
        case 'post':
          response = await instance.post<T>(url, data, { ...mergedConfig });
          action = 'Create';
          break;
        case 'put':
          response = await instance.put<T>(url, data, { ...mergedConfig });
          action = 'Update';
          break;
        case 'patch':
          response = await instance.patch<T>(url, data, { ...mergedConfig });
          action = 'Update';
          break;
        case 'delete':
          response = await instance.delete<T>(url, { ...mergedConfig });
          action = 'Delete';
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        const errorMessage = `Failed to ${action} ${label || ''}`;
        toast.error(errorMessage);
      }

      throw error;
    }
  };

  return executeRequest();
};

export default httpService;
