import axios, { AxiosResponse } from 'axios';

import { Data } from "@/models/data";

export const DATA_SERVICE_SYMBOL: symbol = Symbol('DataService');

export class DataService {
    public async getData(): Promise<Data[]> {
        let data: Data[] = [];
        await axios.get<Data[]>('http://localhost:3000/data').then((response: AxiosResponse) => {
            data = response.data;
        }).catch((error) => {
            console.log(error)
        });
        return data;
    }

    public async updateElement(element: Data): Promise<void> {
        await axios.put<Data>(`http://localhost:3000/data/${element.id}`, element).catch((error) => {
            console.log(error)
        });
    }

    public async addElement(element: Data): Promise<void> {
        await axios.post<Data>('http://localhost:3000/data', element).catch((error) => {
            console.log(error)
        });
    }
}
