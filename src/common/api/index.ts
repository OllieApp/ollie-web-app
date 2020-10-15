import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as firebase from 'firebase/app';

export class OllieAPI {
    static async getClient(): Promise<AxiosInstance> {
        const token = await firebase.auth().currentUser?.getIdToken(true);

        return Axios.create({
            baseURL: process.env.REACT_APP_OLLIE_API_URL,
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async get(path: string, options: AxiosRequestConfig): Promise<AxiosResponse<unknown>> {
        const client = await this.getClient();
        return client.get(path, options);
    }

    static async post(
        path: string,
        data: Record<string, unknown>,
        options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<unknown>> {
        const client = await this.getClient();
        return client.post(path, data, options);
    }

    static async put(
        path: string,
        data: Record<string, unknown>,
        options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<unknown>> {
        const client = await this.getClient();
        return client.put(path, data, options);
    }

    static async patch(
        path: string,
        data: Record<string, unknown>,
        options?: AxiosRequestConfig,
    ): Promise<AxiosResponse<unknown>> {
        const client = await this.getClient();
        return client.patch(path, data, options);
    }

    static async delete(path: string, options?: AxiosRequestConfig): Promise<AxiosResponse<unknown>> {
        const client = await this.getClient();
        return client.delete(path, options);
    }
}
