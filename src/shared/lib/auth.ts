import { env } from "./env";

/**
 * Cookie management for authentication
 */

/**
 * Sets a cookie value
 */
export function setCookie(name: string, value: string, days: number = 30) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Gets a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

/**
 * Deletes a cookie
 */
export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Clears all authentication-related cookies
 * This is useful when migrating from Strapi V4 to V5 to remove incompatible tokens
 */
export function clearAuthCookies() {
  deleteCookie("jwt");
  deleteCookie("userId");
  deleteCookie("__cld_token__");
}

/**
 * Checks if user is authenticated by checking for JWT token
 */
export function authStatus(): boolean {
  const jwt = getCookie("jwt");
  return !!jwt;
}

/**
 * Gets authentication headers for API requests
 */
export function getAuthHeaders(): { [key: string]: string } {
  const jwt = getCookie("jwt");
  return {
    "Content-Type": "application/json",
    ...(jwt && { Authorization: `Bearer ${jwt}` }),
  };
}

/**
 * Logout user by clearing cookies and redirecting
 */
export function logout() {
  clearAuthCookies();
  window.location.href = "/login";
}
