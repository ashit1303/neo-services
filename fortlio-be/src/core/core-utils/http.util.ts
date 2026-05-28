import axios, { AxiosRequestConfig } from 'axios';

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.get<T>(url, config);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Message:', error.message);
      console.error('Method:', error.config?.method);
      console.error('URL:', error.config?.url);
      console.error('Request Data:', error.config?.data);
      console.error('Request Headers:', error.config?.headers);
      console.error('Response:', error.response);
      console.error('Cause:', error.cause);
    }
    else {
      console.error(error);
    }
    throw error;
  }
};

export const post = async <T>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.post<T>(url, data, config);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Message:', error.message);
      console.error('Method:', error.config?.method);
      console.error('URL:', error.config?.url);
      console.error('Request Data:', error.config?.data);
      // console.error('Request Headers:', error.config?.headers);
      console.error('Response:', error.response?.config);
      console.error('Response Data:', error.response?.data);
      console.error('Cause:', error.cause);
    }
    else {
      console.error(error);
    }
    throw error;
  };
};

export const put = async <T>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.put<T>(url, data, config);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Message:', error.message);
      console.error('Method:', error.config?.method);
      console.error('URL:', error.config?.url);
      console.error('Request Data:', error.config?.data);
      console.error('Request Data:', error.config?.data);
      // console.error('Request Headers:', error.config?.headers);
      console.error('Response:', error.response?.config);
      console.error('Response Data:', error.response?.data);
      console.error('Cause:', error.cause);
    }
    else {
      console.error(error);
    }
    throw error;
  }
};
