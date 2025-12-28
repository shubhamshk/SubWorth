export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    redirectUrl?: string;
}
