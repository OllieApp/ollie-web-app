import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import firebase from 'firebase/app';

export class OllieAPI {
  static getClient(): AxiosInstance {
    const client = Axios.create({
      baseURL: process.env.REACT_APP_OLLIE_API_URL,
    });
    client.interceptors.request.use(async (request) => {
      request.headers = { Authorization: `Bearer ${await firebase.auth().currentUser?.getIdToken()}` };
      return request;
    });

    return client;
  }

  static async get<T = unknown>(path: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.get<T>(path, {
      ...options,
      headers: await firebase.auth().currentUser?.getIdToken(),
    });
  }

  static async post<T = unknown>(
    path: string,
    data?: Record<string, unknown> | FormData,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.post<T>(path, data, options);
  }

  static async put<T = unknown>(
    path: string,
    data: Record<string, unknown> | FormData,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.put<T>(path, data, options);
  }

  static async patch<T = unknown>(
    path: string,
    data: Record<string, unknown> | FormData | any,
    options?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.patch<T>(path, data, options);
  }

  static async delete<T = unknown>(path: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.delete<T>(path, options);
  }
}
