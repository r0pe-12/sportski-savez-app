export type SchoolSummary = {
    id: number;
    code: string;
    name: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'professor' | 'student';
    school: SchoolSummary | null;
    email_verified_at?: string | null;
    verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
};

export type AuthUser = User;

export type Auth = {
    user: User | null;
};

export type SharedData = {
    name: string;
    auth: Auth;
    notifications: { unread_count: number };
    sidebarOpen: boolean;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
