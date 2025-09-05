"use client";

import { useState } from "react";
import { env } from "@/shared/lib/env";

interface ForgotPasswordResponse {
  ok: boolean;
}

interface ResetPasswordData {
  code: string;
  password: string;
  passwordConfirmation: string;
}

interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Hook for handling forgot password functionality
 */
export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "neutral";
    text: string;
  }>({ type: "neutral", text: "" });

  /**
   * Send forgot password email
   */
  const sendForgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setMessage({ type: "neutral", text: "" });

    try {
      const response = await fetch(`${env.API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data: ForgotPasswordResponse = await response.json();

      if (data.ok) {
        setMessage({
          type: "success",
          text: "Success! Within 10 minutes you will receive an email with instructions to reset your password.",
        });
        return true;
      } else {
        throw new Error("Request failed");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ooops! The informed email doesn't exist in our database. Please inform your registration email.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendForgotPassword,
    isLoading,
    message,
  };
}

/**
 * Hook for handling reset password functionality
 */
export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "neutral";
    text: string;
  }>({ type: "neutral", text: "" });

  /**
   * Validate password requirements
   */
  const validatePassword = (
    newPassword: string,
    confirmPassword: string
  ): PasswordValidationResult => {
    // Check minimum length for new password
    if (newPassword.length < 8) {
      return {
        isValid: false,
        error: "New password must be at least 8 characters long",
      };
    }

    // Check minimum length for confirmation
    if (confirmPassword.length < 8) {
      return {
        isValid: false,
        error: "Confirmation password must be at least 8 characters long",
      };
    }

    // Check for spaces
    if (newPassword.includes(" ") || confirmPassword.includes(" ")) {
      return {
        isValid: false,
        error: "Passwords cannot contain spaces",
      };
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return {
        isValid: false,
        error:
          "Passwords do not match. Please make sure both entries are identical",
      };
    }

    return { isValid: true };
  };

  /**
   * Reset password with code
   */
  const resetPassword = async (data: ResetPasswordData): Promise<boolean> => {
    setIsLoading(true);
    setMessage({ type: "neutral", text: "" });

    // Validate passwords first
    const validation = validatePassword(
      data.password,
      data.passwordConfirmation
    );
    if (!validation.isValid) {
      setMessage({
        type: "error",
        text: validation.error!,
      });
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${env.API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Reset failed");
      }

      setMessage({
        type: "success",
        text: "Password reset successful! You will be redirected to login...",
      });
      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to reset password. Please try again or contact support if the issue persists.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear message (useful for clearing errors on input change)
   */
  const clearMessage = () => {
    setMessage({ type: "neutral", text: "" });
  };

  return {
    resetPassword,
    validatePassword,
    clearMessage,
    isLoading,
    message,
  };
}
