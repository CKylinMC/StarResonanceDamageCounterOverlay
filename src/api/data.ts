import { DPSResponse } from "../types/data";
import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import { getMockData, clearMockData, IS_MOCK_MODE } from './mock';

export const serverPath = () => "http://localhost:8989";

export const alova = createAlova({
    requestAdapter: adapterFetch(),
    responded: response => response.json(),
    baseURL: serverPath(),
    cacheFor: {GET:0},
});

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const useMockData = isDevelopment && IS_MOCK_MODE;

export const getData = (): Promise<DPSResponse> => {
    if (useMockData) {
        console.log('🔧 Using mock data for development');
        return getMockData();
    }
    return alova.Get<DPSResponse>("/api/data");
};

export const clearData = () => {
    if (useMockData) {
        console.log('🔧 Clearing mock data');
        return clearMockData();
    }
    return alova.Get("/api/clear");
};
