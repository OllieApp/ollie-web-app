import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as firebase from 'firebase/app';

export class OllieAPI {
    static token?: string;

    static async getClient(): Promise<AxiosInstance> {
        if (!this.token) {
            this.token = await firebase.auth().currentUser?.getIdToken(false);
        }

        return Axios.create({
            baseURL: process.env.REACT_APP_OLLIE_API_URL,
            headers: { Authorization: `bearer ${this.token}` },
        });
    }

    static async get<T = unknown>(path: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const client = await this.getClient();
        return client.get<T>(path, options);
    }

    static async post<T = unknown>(
        path: string,
        data: Record<string, unknown> | FormData,
        options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        const client = await this.getClient();
        return client.post<T>(path, data, options);
    }

    static async put<T = unknown>(
        path: string,
        data: Record<string, unknown> | FormData,
        options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        const client = await this.getClient();
        return client.put<T>(path, data, options);
    }

    static async patch<T = unknown>(
        path: string,
        data: Record<string, unknown> | FormData,
        options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
        const client = await this.getClient();
        return client.patch<T>(path, data, options);
    }

    static async delete<T = unknown>(path: string, options?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const client = await this.getClient();
        return client.delete<T>(path, options);
    }
}
