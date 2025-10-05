import { axiosInstance } from '../axios';

// Storage keys
export const STORAGE_KEYS = {
  USER: 'auth_user',
  TOKEN: 'auth_token',
} as const;

// Token utilities
export const tokenUtils = {
  // Get stored token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Set token
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  // Remove token
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Check if token exists
  hasToken: (): boolean => {
    return !!tokenUtils.getToken();
  },

  // Token expiration utilities (if using JWT)
  isTokenExpired: (token: string): boolean => {
    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true; // Invalid token
    }
  },

  // Validate current token
  isValidToken: (): boolean => {
    const token = tokenUtils.getToken();
    if (!token) return false;
    return !tokenUtils.isTokenExpired(token);
  },
};

// User data utilities
export const userUtils = {
  // Get stored user data
  getUser: () => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  // Set user data
  setUser: (userData: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  },

  // Remove user data
  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Update user data
  updateUser: (updates: any): void => {
    const currentUser = userUtils.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      userUtils.setUser(updatedUser);
    }
  },
};

// Auth utilities
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return tokenUtils.hasToken() && tokenUtils.isValidToken() && !!userUtils.getUser();
  },

  // Clear all auth data
  clearAuthData: (): void => {
    tokenUtils.removeToken();
    userUtils.removeUser();
  },

  // Setup axios auth header
  setupAuthHeader: (): void => {
    const token = tokenUtils.getToken();
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  // Refresh token (if your API supports it)
  refreshToken: async (): Promise<boolean> => {
    try {
      // TODO: Implement token refresh logic with your API
      // This would typically call a refresh token endpoint
      const response = await axiosInstance.post('/auth/refresh');

      if ((response.data as any).token) {
        tokenUtils.setToken((response.data as any).token);

        // Update user data if provided
        if ((response.data as any).user) {
          userUtils.setUser((response.data as any).user);
        }

        authUtils.setupAuthHeader();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      authUtils.clearAuthData();
      return false;
    }
  },

  // Initialize auth headers on app start
  initializeAuth: (): void => {
    if (authUtils.isAuthenticated()) {
      authUtils.setupAuthHeader();
    }
  },
};

// Role-based access control utilities
export const rbacUtils = {
  // Check if user has required role
  hasRole: (userRoles: string | string[], requiredRole: string): boolean => {
    const user = userUtils.getUser();
    if (!user || !user.role) return false;

    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
    return roles.includes(user.role);
  },

  // Check if user has any of the required roles
  hasAnyRole: (requiredRoles: string[]): boolean => {
    const user = userUtils.getUser();
    if (!user || !user.role) return false;

    return requiredRoles.includes(user.role);
  },

  // Check if user has all required roles
  hasAllRoles: (requiredRoles: string[]): boolean => {
    const user = userUtils.getUser();
    if (!user || !user.role) return false;

    return requiredRoles.every(role => role === user.role);
  },

  // Common role checks
  isAdmin: (): boolean => {
    const user = userUtils.getUser();
    return user ? rbacUtils.hasRole(user.role, 'admin') : false;
  },
  isPractitioner: (): boolean => {
    const user = userUtils.getUser();
    return user ? rbacUtils.hasRole(user.role, 'practitioner') : false;
  },
  isStaff: (): boolean => rbacUtils.hasAnyRole(['admin', 'practitioner']),
};

// Permission utilities (if you have more granular permissions)
export const permissionUtils = {
  // Check specific permission
  hasPermission: (permission: string): boolean => {
    const user = userUtils.getUser();
    if (!user) return false;

    // If user has admin role, they have all permissions
    if (rbacUtils.isAdmin()) return true;

    // TODO: Implement granular permission checking
    // This could check against stored permissions array or make API call
    return false;
  },

  // Check multiple permissions
  hasAllPermissions: (permissions: string[]): boolean => {
    return permissions.every(permission => permissionUtils.hasPermission(permission));
  },

  // Check if user has any of the permissions
  hasAnyPermission: (permissions: string[]): boolean => {
    return permissions.some(permission => permissionUtils.hasPermission(permission));
  },
};

export default {
  tokenUtils,
  userUtils,
  authUtils,
  rbacUtils,
  permissionUtils,
};
