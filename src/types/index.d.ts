// API Response formats
export interface ApiError {
    code: string;
    message: string;
    warning?: string;
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

export interface DeleteTokenResponse {
    message: string;
}

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

export interface DeleteTokenRequest {
    token: string;
}

// * Request Queries (Query Params)
export interface GradesQuery {
    year?: string;
    privateGrades?: string;
}

// FUll srapping type helpers

export type recoveryStatusCode = "SAT" | "INS" | "NC" | "NAC";
export type recoveryMessages =
    | "Satisfatório"
    | "Insatisfatório"
    | "Não Compareceu"
    | "Não aconteceu";

export interface BoletimData {
    yearCount: number;
    yearsInfo: Array<YearInfo>;
}

export interface YearInfo {
    tittle: string;
    year: number;
    status: string;
    results: Array<ResultData>;
    grades: Array<FullGrades>;
    bimestersData: Array<BimesterData>;
}

export interface ResultData {
    gradeName: string;
    grade: number;
    totalAbsences: number;
}

export interface FullGrades {
    // uma row da tabela
    gradeName: string;
    userGrades: Array<PersonalBiInformation>;
    classGrades: Array<ClassBiInformation>;
}

export interface BimesterData {
    userAvarage: number;
    classAvarage: number;
    totalAbsences: number;
}

export interface PersonalBiInformation {
    // Personal (the student) Bimester Information
    grade: number;
    absences: number;
    recovery: Boolean;
    recovered?: Boolean;
    recoveryCode?: recoveryStatusCode; // "SAT", "INS", "NC", "NAC"
    recoveryMessage?: recoveryMessages; // "Saturado, "Insaturado", "Não compareceu", "Não aconteceu"
}
1;
export interface ClassBiInformation {
    // Class Bimester Information
    avarageGrade: number;
}
