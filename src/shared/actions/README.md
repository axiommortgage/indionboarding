# Shared Authentication Actions

This directory contains reusable server-side authentication functions that can be used across all features in the application.

## Available Functions

### 1. `checkAuthAction()`

**Purpose**: Check if a user is authenticated without fetching user data.

**Use Case**: Route protection, authentication status checks.

**Returns**: `{ isAuthenticated: boolean; userId?: string }`

**Example**:
```typescript
import { checkAuthAction } from "@/shared/actions/auth";

export default async function ProtectedPage() {
  const { isAuthenticated } = await checkAuthAction();
  
  if (!isAuthenticated) {
    redirect("/login");
  }
  
  return <div>Protected content</div>;
}
```

### 2. `getUserAction()`

**Purpose**: Fetch only user data (without notifications/one-pages).

**Use Case**: When you only need basic user information.

**Returns**: `{ userInfo: User | null }`

**Example**:
```typescript
import { getUserAction } from "@/shared/actions/auth";

export default async function UserProfilePage() {
  const { userInfo } = await getUserAction();
  
  if (!userInfo) {
    redirect("/login");
  }
  
  return <div>Welcome, {userInfo.name}!</div>;
}
```

### 3. `getUserDataAction()`

**Purpose**: Fetch user data, notifications, and one-pages.

**Use Case**: When you need complete user data including notifications and one-pages.

**Returns**: `{ userInfo: User | null; notifications: Notification[]; onePages: OnePage[] }`

**Example**:
```typescript
import { getUserDataAction } from "@/shared/actions/auth";

export default async function DashboardPage() {
  const { userInfo, notifications, onePages } = await getUserDataAction();
  
  if (!userInfo) {
    redirect("/login");
  }
  
  return (
    <div>
      <h1>Welcome, {userInfo.name}!</h1>
      <p>You have {notifications.length} notifications</p>
      <p>You have {onePages.length} one-pages</p>
    </div>
  );
}
```

## Usage Patterns

### Route Protection Pattern
```typescript
import { checkAuthAction } from "@/shared/actions/auth";
import { redirect } from "next/navigation";

export default async function ProtectedRoute() {
  const { isAuthenticated } = await checkAuthAction();
  
  if (!isAuthenticated) {
    redirect("/login");
  }
  
  // Your protected content here
}
```

### User Data with Fallback Pattern
```typescript
import { getUserAction } from "@/shared/actions/auth";

export default async function UserPage() {
  const { userInfo } = await getUserAction();
  
  if (!userInfo) {
    return (
      <div>
        <h1>Authentication Required</h1>
        <a href="/login">Please log in</a>
      </div>
    );
  }
  
  return <div>Welcome, {userInfo.name}!</div>;
}
```

### Complete User Data Pattern
```typescript
import { getUserDataAction } from "@/shared/actions/auth";

export default async function FeaturePage() {
  const { userInfo, notifications, onePages } = await getUserDataAction();
  
  if (!userInfo) {
    redirect("/login");
  }
  
  // Use all the data
  return (
    <div>
      <h1>{userInfo.name}</h1>
      <NotificationsList notifications={notifications} />
      <OnePagesList onePages={onePages} />
    </div>
  );
}
```

## Error Handling

All functions include comprehensive error handling:

- **Authentication failures** return appropriate null values
- **API errors** are logged to console
- **Network errors** are caught and handled gracefully
- **Missing cookies** are handled without throwing errors

## Performance Considerations

- **Parallel API calls**: `getUserDataAction` fetches data in parallel using `Promise.all`
- **Minimal data fetching**: Use `getUserAction` when you only need user data
- **Caching**: Consider implementing caching for frequently accessed data

## Security Features

- **JWT validation**: All functions validate JWT tokens
- **Cookie security**: Uses secure cookie settings in production
- **Error logging**: Comprehensive logging for debugging without exposing sensitive data

## Migration Guide

If you have existing authentication code:

1. **Replace manual cookie checks** with `checkAuthAction()`
2. **Replace user data fetching** with `getUserAction()` or `getUserDataAction()`
3. **Remove duplicate authentication logic** from individual features
4. **Update error handling** to use the standardized return values

## Examples by Feature

### Client Gift Feature
```typescript
// Before (duplicated logic)
const cookieStore = await cookies();
const jwt = cookieStore.get("jwt")?.value;
const userId = cookieStore.get("userId")?.value;

// After (using shared action)
const { userInfo } = await getUserAction();
```

### Dashboard Feature
```typescript
// Before (manual API calls)
const userResponse = await fetch(`${env.API_URL}/api/users-permissions/users-light/${userId}`);

// After (using shared action)
const { userInfo, notifications, onePages } = await getUserDataAction();
```

### Profile Feature
```typescript
// Before (route protection)
if (!jwt || !userId) redirect("/login");

// After (using shared action)
const { isAuthenticated } = await checkAuthAction();
if (!isAuthenticated) redirect("/login");
```
