// API Response formats
export interface ApiError {
    code: string;
    message: string;
    field?: string;
}

interface ApiSucess<T = any> {
    success: true;
    data: T;
    errors?: never;
}

interface ApiFailure {
    success: false;
    data?: never;
    errors: Array<ApiError>;
}

export type ApiResponse<T = any> = ApiSucess<T> | ApiFailure;

// * Data response
export interface RegisterDataResponse {
    message: string;
    userId: number;
}

export interface LoginDataResponse extends RegisterDataResponse {} // JWT Token on header

export interface NsacApiResponse {
    message: string;
    userId: string;
    nsacAccountId: number;
    apiToken: string;
}

interface NsacToken {
    token: string;
    id_NsacAccount: number;
}

export type NsacTokensResponse = Array<NsacToken>;

// API Request formats
export interface RegisterAuthRequest {
    name: string;
    email: string;
    password: string;
}

export interface BasicNsacApiRequest {
    email: string;
    userId: string;
    password: string;
}
