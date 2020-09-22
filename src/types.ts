export interface AuthUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    category: string;
    gender: string;
}

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    category: string;
    gender: string;
    active?: boolean;
}
