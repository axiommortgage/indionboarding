# Authentication System Implementation

## Overview

This document outlines the complete authentication system implemented for IndiCentral, following modern NextJS 15 patterns while replicating the functionality from the legacy project.

## Architecture

### 🏗️ **Core Components**

#### **1. Authentication Context (`src/shared/contexts/auth-context.tsx`)**

- **Central state management** for authentication across the application
- **Automatic initialization** on app startup
- **Token validation** and refresh handling
- **Login/logout functionality** with proper state updates
- **Cross-tab logout detection** via storage events

#### **2. Auth Utilities (`src/shared/lib/auth.ts`)**

- **JWT token parsing** and validation
- **Cookie management** with proper security settings
- **Auth status checking** with expiration handling
- **Automatic cleanup** on token expiration

#### **3. Authentication Hooks (`src/shared/hooks/use-auth.ts`)**

- **useAuth()**: Login functionality with error handling
- **useUserData()**: Parallel API calls for user data, notifications, and one-pages
- **Type-safe** error handling and loading states

#### **4. Auth Guard (`src/shared/components/auth-guard.tsx`)**

- **Route protection** for authenticated pages
- **Automatic redirects** to login for unauthenticated users
- **Loading states** while authentication initializes
- **Fallback components** for better UX

#### **5. Loading Components (`src/shared/ui/loading.tsx`)**

- **Beautiful loading screens** with IndiCentral branding
- **Skeleton loaders** for better perceived performance
- **Different variants** for different loading states

## Features Implemented

### ✅ **Authentication Flow**

1. **App Initialization**:

   - Check for existing JWT token in cookies
   - Validate token expiration
   - Fetch user data, notifications, and onePages in parallel
   - Set authentication state

2. **Login Process**:

   - Form validation with real-time error display
   - API call to Strapi backend
   - Cookie setting with proper security
   - Context state update
   - Automatic redirect to dashboard

3. **Route Protection**:

   - AuthGuard wrapper for protected routes
   - Automatic redirect to login for unauthenticated users
   - Loading states during authentication checks

4. **Logout Process**:
   - Clear all authentication cookies
   - Reset context state
   - Clear local storage
   - Redirect to login page

### ✅ **Modern Login Page**

- **Shadcn-styled** two-column responsive layout
- **Eye-catching branding** with gradient backgrounds
- **Form validation** with proper error handling
- **Loading states** with spinner and disabled inputs
- **Password visibility toggle**
- **Forgot password link**
- **Terms and privacy links**

### ✅ **Dynamic Navigation**

- **Partner pages** populated from API data
- **Alphabetically sorted** menu items
- **External link handling** with proper indicators
- **Collapsible submenus** for better organization

### ✅ **Error Handling**

- **Network error** graceful handling
- **Token expiration** automatic cleanup
- **API failure** fallback states
- **User-friendly** error messages

## Integration Points

### **Root Layout (`src/app/layout.tsx`)**

```tsx
<AuthProvider>{children}</AuthProvider>
```

### **Dashboard Layout (`src/app/(dashboard)/layout.tsx`)**

```tsx
<AuthGuard>
  <DashboardContent>{children}</DashboardContent>
</AuthGuard>
```

### **Component Usage**

```tsx
const { userAuth, login, logout } = useAuthContext();
```

## API Integration

### **Endpoints Used**

- `POST /auth/local` - User login
- `GET /users-permissions/users-light/{userId}` - User data
- `GET /notifications` - User notifications
- `GET /one-pages` - Partner pages

### **Cookie Management**

- `jwt` - Authentication token (30 days)
- `userId` - User identifier (30 days)
- `__cld_token__` - Cloudflare token (30 days)

### **Headers**

- `Authorization: Bearer {jwt}`
- `Content-Type: application/json`

## Security Features

### ✅ **Token Security**

- **JWT expiration** validation
- **Automatic cleanup** on expiration
- **Secure cookie** settings
- **SameSite protection**

### ✅ **Route Protection**

- **AuthGuard** component for protected routes
- **Middleware** for maintenance mode
- **Security headers** for sensitive documents

### ✅ **Error Prevention**

- **Type safety** throughout the system
- **Input validation** on forms
- **Network error** handling
- **Graceful degradation**

## Legacy Pattern Compliance

### ✅ **Patterns Replicated**

- **Context-based** state management
- **Parallel API calls** for initialization
- **Cookie-based** authentication
- **Error handling** with user feedback
- **Loading states** during operations
- **Automatic redirects** for auth flow

### ✅ **Modern Improvements**

- **TypeScript** throughout
- **React hooks** instead of class components
- **Modern NextJS 15** App Router
- **Shadcn components** for UI
- **Better error boundaries**
- **Improved performance** with parallel requests

## Usage Examples

### **Login Page**

- Navigate to `/login`
- Enter credentials
- Automatic redirect to dashboard on success
- Error display for invalid credentials

### **Protected Routes**

- All `/dashboard/*` routes are protected
- Automatic redirect to login if not authenticated
- Loading states while authentication initializes

### **Logout**

- Available in header and sidebar dropdowns
- Clears all auth data
- Redirects to login page

## Testing Scenarios

### ✅ **Authentication States**

1. **Fresh user** - Show login page
2. **Valid token** - Show dashboard
3. **Expired token** - Clear data, show login
4. **Network failure** - Show error, retry option
5. **Invalid credentials** - Show error message

### ✅ **Navigation Flow**

1. **Login success** → Dashboard
2. **Logout** → Login page
3. **Protected route access** → Login redirect
4. **Token expiration** → Login redirect

The authentication system is now fully functional and follows modern best practices while maintaining compatibility with the existing Strapi V3 backend.
