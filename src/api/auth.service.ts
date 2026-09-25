import apiClient from './apiClient';
import { LoginCredentials, AuthResponse, User } from '../types/auth';

export class AuthService {
    private client = apiClient;
    private TOKEN_KEY = 'auth_token';

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        console.log('[AuthService] Tentative de connexion avec :', credentials);

        try {
            const response = await this.client.post<AuthResponse>('/auth/login', credentials);


            if (response.data && response.data.token) {
                localStorage.setItem(this.TOKEN_KEY, response.data.token);
            }

            return response.data;
        } catch (error: any) {
            console.error('[AuthService] Erreur lors de la connexion :', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (!token) return null;

        console.log('getCurrentUser', token);

        const response = await this.client.get<User>('/auth/me');
        console.log('response', response);

        return response.data;
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }
}

export const authService = new AuthService();