# Authentication System

This project now includes a complete authentication system with React Context API, token management, and integration with the existing API setup.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AuthProvider (Context)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ AuthContext │ │ authUtils   │ │ axios interceptors  │   │
│  │             │ │             │ │                     │   │
│  │ - User state│ │ - Token mgmt│ │ - Auto token refresh │   │
│  │ - Login/logout││ - RBAC      │ │ - Auto logout 401   │   │
│  │ - Loading   │ │ - Storage   │ │ - Header injection  │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Pages                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Settings    │ │ Login       │ │ Dashboard   │  ...       │
│  │             │ │             │ │             │            │
│  │ useAuth()   │ │ useAuth()   │ │ useAuth()   │            │
│  │ - user.id   │ │ - login()   │ │ - user info │            │
│  │ - user data │ │ - loading   │ │ - auth state│            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Files Created/Modified

### 1. Authentication Context (`lib/auth/AuthContext.tsx`)
- **AuthProvider**: React context provider component
- **useAuth**: Custom hook for consuming auth context
- **User Interface**: TypeScript interface for user data
- **Storage Management**: localStorage for persistence
- **Mock Login**: Demo authentication (replace with real API)

### 2. Auth Utilities (`lib/auth/authUtils.ts`)
- **Token Management**: JWT token handling and validation
- **Storage Utilities**: localStorage operations for user/token data
- **Auth State Management**: Authentication status checking
- **RBAC Functions**: Role-based access control utilities
- **Permission System**: Granular permission checking (extensible)

### 3. Auth Module Index (`lib/auth/index.ts`)
- Clean exports for easy importing across the app

### 4. Axios Integration (`lib/axios.ts`)
- **Token Injection**: Automatic token header injection
- **Auto Refresh**: 401 error handling with token refresh
- **Auto Logout**: Clear auth data and redirect on auth failure

### 5. Layout Integration (`app/layout.tsx`)
- **AuthProvider Wrapper**: Wraps entire app with auth context

### 6. Settings Page (`app/settings/page.tsx`)
- **Auth Integration**: Uses `useAuth()` instead of hardcoded user ID
- **Authentication Checks**: Shows login prompt if not authenticated
- **Loading States**: Proper loading handling during auth initialization

### 7. Login Page (`app/login/page.tsx`)
- **Real Auth Integration**: Uses auth context for login/logout
- **Error Handling**: Displays login errors properly
- **Loading States**: Shows loading spinner during login

## Usage Examples

### Basic Auth Hook Usage

```typescript
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome, {user?.first_name}!</h1>
      <p>Your ID: {user?.id}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Login Implementation

```typescript
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect happens automatically in auth context
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Role-Based Access Control

```typescript
import { rbacUtils } from '@/lib/auth';

function AdminPanel() {
  const canAccess = rbacUtils.isAdmin();

  if (!canAccess) {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}
```

### Token Management

```typescript
import { tokenUtils, authUtils } from '@/lib/auth';

// Manual token operations
const token = tokenUtils.getToken();
const isValid = tokenUtils.isValidToken();

// Clear auth data
authUtils.clearAuthData();

// Setup axios headers manually
authUtils.setupAuthHeader();
```

## Configuration

### Demo Credentials
- **Email**: `demo@example.com`
- **Password**: `password`

### Storage Keys
The system uses these localStorage keys:
- `auth_user`: JSON string of user data
- `auth_token`: JWT token string

### Customization

#### Replace Mock Login
Update the `mockLoginAPI` function in `AuthContext.tsx` with real API integration:

```typescript
async function mockLoginAPI(email: string, password: string) {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password,
  });

  return {
    user: response.data.user,
    token: response.data.token,
  };
}
```

#### Add Real Token Refresh
Update the `refreshToken` function in `authUtils.ts`:

```typescript
refreshToken: async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/auth/refresh');
    // Handle response...
  } catch (error) {
    // Handle error...
  }
}
```

#### Custom RBAC
Extend the `rbacUtils` object with your role definitions:

```typescript
export const rbacUtils = {
  // ... existing methods

  // Custom roles
  isManager: (): boolean => rbacUtils.hasRole('manager'),
  isSuperAdmin: (): boolean => rbacUtils.hasRole('super_admin'),

  // Custom role combinations
  canManageUsers: (): boolean => rbacUtils.hasAnyRole(['admin', 'manager']),
};
```

## Security Features

1. **Token Validation**: JWT expiration checking
2. **Auto Logout**: Clears data on invalid tokens
3. **Secure Storage**: localStorage with error handling
4. **Request Interception**: Automatic token injection
5. **Error Handling**: Proper 401 handling with refresh attempts
6. **Loading States**: Prevents multiple simultaneous requests

## Next Steps

1. **Real API Integration**: Replace mock login with actual authentication API
2. **Password Reset**: Implement forgot password functionality
3. **User Registration**: Add signup flow
4. **Profile Management**: Allow users to update their profile
5. **Session Management**: Add session timeout and refresh logic
6. **Testing**: Add unit tests for auth functions
7. **Security**: Implement proper token refresh and rotation

## Benefits

- **Centralized Auth State**: Single source of truth for authentication
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Robust error handling and user feedback
- **Loading States**: Proper loading indicators throughout
- **Extensible**: Easy to add new auth features and roles
- **Secure**: Built-in security features and token management
- **Developer Friendly**: Clean APIs and comprehensive documentation
