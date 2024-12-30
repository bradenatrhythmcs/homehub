import { useState, useCallback } from 'react';
import { fetchWithError } from '../utils/errorUtils';

export const useApi = (initialData = null) => {
    const [data, setData] = useState(initialData);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const request = useCallback(async (url, options = {}) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchWithError(url, options);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        data,
        error,
        isLoading,
        request,
        setData,
        setError
    };
}; 