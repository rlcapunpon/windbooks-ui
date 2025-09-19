import apiClient from './client';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermission[];
}

export interface RolePermission {
  permission: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface UserRole {
  role: Role;
}

export interface User {
  id: string;
  email: string;
  organizationCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RefreshData {
  refreshToken: string;
}

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<void> {
    await apiClient.post('/auth/register', data);
  }

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  }

  async refreshToken(data: RefreshData): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }
}

export const authService = new AuthService();
export default authService;