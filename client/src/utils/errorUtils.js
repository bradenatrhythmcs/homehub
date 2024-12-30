// Common error types
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    AUTH: 'AUTH_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    SERVER: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNKNOWN: 'UNKNOWN_ERROR'
};

export class AppError extends Error {
    constructor(message, statusCode = 500, type = 'SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.type = type;
        this.name = 'AppError';
    }
}

// Error handler that categorizes errors
export const handleApiError = (error) => {
    if (!error.response) {
        return {
            type: ErrorTypes.NETWORK,
            message: 'Unable to connect to server. Please check your internet connection.'
        };
    }

    const { status } = error.response;
    
    switch (status) {
        case 400:
            return {
                type: ErrorTypes.VALIDATION,
                message: error.response.data.message || 'Invalid request'
            };
        case 401:
            return {
                type: ErrorTypes.AUTH,
                message: 'Please log in to continue'
            };
        case 403:
            return {
                type: ErrorTypes.AUTH,
                message: 'You do not have permission to perform this action'
            };
        case 404:
            return {
                type: ErrorTypes.NOT_FOUND,
                message: 'The requested resource was not found'
            };
        case 500:
            return {
                type: ErrorTypes.SERVER,
                message: 'An internal server error occurred. Please try again later.'
            };
        default:
            return {
                type: ErrorTypes.UNKNOWN,
                message: 'An unexpected error occurred'
            };
    }
};

export const getDefaultHeaders = () => {
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('token');
    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }

    return defaultHeaders;
};

export const fetchWithError = async (url, options = {}) => {
    const defaultHeaders = getDefaultHeaders();
    const timeout = options.timeout || 30000; // 30 second default timeout
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const fetchOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            signal: controller.signal
        };

        const response = await fetch(url, fetchOptions);
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            let errorData;
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
            } else {
                errorData = { message: await response.text() };
            }

            // Map HTTP status to our error types
            let errorType;
            switch (response.status) {
                case 400:
                    errorType = ErrorTypes.VALIDATION;
                    break;
                case 401:
                case 403:
                    errorType = ErrorTypes.AUTH;
                    break;
                case 404:
                    errorType = ErrorTypes.NOT_FOUND;
                    break;
                case 500:
                    errorType = ErrorTypes.SERVER;
                    break;
                default:
                    errorType = ErrorTypes.UNKNOWN;
            }

            throw new AppError(
                errorData.message || errorData.error || 'An error occurred',
                response.status,
                errorType
            );
        }

        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        return response.text();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new AppError('Request timeout', 408, ErrorTypes.NETWORK);
        }
        if (error instanceof AppError) {
            throw error;
        }
        if (!navigator.onLine) {
            throw new AppError('No internet connection', 0, ErrorTypes.NETWORK);
        }
        throw new AppError(
            error.message || 'Network error',
            0,
            ErrorTypes.NETWORK
        );
    } finally {
        clearTimeout(timeoutId);
    }
}; 