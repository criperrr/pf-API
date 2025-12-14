// API Response formats
export interface ApiError {
    code: string;
    message: string;
    warning?: string;
    field?: string;
}

export interface ApiSucess<T = any> {
    success: true;
    data: T;
    errors?: never;
}

export interface ApiFailure {
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

export interface NsacToken {
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
// --- Filtros Genéricos ---
export type NumberFilter = {
    eq?: number;
    neq?: number;
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
};

export type StringFilter = {
    eq?: string;
    contains?: string;
    startsWith?: string;
};

export type BooleanFilter = {
    eq?: boolean;
};

export type FilterBuilder<T> = {
    [K in keyof T]?: T[K] extends number | undefined
        ? NumberFilter | number
        : T[K] extends string | undefined
        ? StringFilter | string
        : T[K] extends boolean | undefined
        ? BooleanFilter | boolean
        : T[K];
};

// --- Query  ---
export interface Query {
    //                                                ▲
    schoolYear?: number; // Ex: "2"                   | mais abrangente
    targetBimester?: number; // 1, 2, 3, 4            |
    subjectName?: string; // Ex: "Matemática", "Mat"  |
    isRecovery?: boolean; // Se ficou de recuperação  |
    recoveryCode?: string; // Ex: "SAT"               |
    grade?: number; // Nota do aluno                  |
    classAverage?: number; // Média da turma          | menos abrangente (n necessariamente é menos abrangente).
    //                                                ▼
}

export interface QueryFilter extends FilterBuilder<Query> {}

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
    grades: Array<FullGrades>;
    bimestersMetrics: Array<BimesterData>;
}

export interface ResultData {
    grade: number;
    totalAbsences: number;
}

export interface FullGrades {
    // uma row da tabela
    subjectName: string;
    results: ResultData;
    bimesters: Array<UnifiedBimesterData>;
}

export interface UnifiedBimesterData {
    bimester: number; // 1, 2, 3, 4
    personal: PersonalBiInformation;
    class: ClassBiInformation;
}

export interface BimesterData {
    userAverage: number;
    classAverage: number;
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
    averageGrade: number;
}

export interface AllYearsInfo {
    warning: boolean | string;
    userCurrentYear: number;
    data: YearInfo[];
}
