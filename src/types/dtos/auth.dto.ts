// Requests
export interface RegisterAuthRequest {
    name: string;
    email: string;
    password: string;
}

export interface DeleteTokenRequest {
    token: string;
}

// Responses
export interface RegisterResponse {
    message: string;
    userId: number;
}

export interface LoginResponse extends RegisterResponse {} // Implicit JWT logic

export interface DeleteTokenResponse {
    message: string;
}

export interface JwtTokenPayload {
    id_user: string;
    email: string;
}
