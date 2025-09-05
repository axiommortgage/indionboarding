import { renderHook, act } from "@testing-library/react";
import { useForgotPassword, useResetPassword } from "../use-password-reset";

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("useForgotPassword", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should send forgot password request successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const { result } = renderHook(() => useForgotPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.message.type).toBe("neutral");

    await act(async () => {
      const success = await result.current.sendForgotPassword(
        "test@example.com"
      );
      expect(success).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:1339/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com" }),
      }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.message.type).toBe("success");
    expect(result.current.message.text).toContain("Success! Within 10 minutes");
  });

  it("should handle forgot password request failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      const success = await result.current.sendForgotPassword(
        "invalid@example.com"
      );
      expect(success).toBe(false);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.message.type).toBe("error");
    expect(result.current.message.text).toContain(
      "doesn't exist in our database"
    );
  });

  it("should handle non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false }),
    } as Response);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      const success = await result.current.sendForgotPassword(
        "test@example.com"
      );
      expect(success).toBe(false);
    });

    expect(result.current.message.type).toBe("error");
  });
});

describe("useResetPassword", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should validate passwords correctly", () => {
    const { result } = renderHook(() => useResetPassword());

    // Test minimum length validation
    const shortPassword = result.current.validatePassword("short", "short");
    expect(shortPassword.isValid).toBe(false);
    expect(shortPassword.error).toContain("at least 8 characters");

    // Test spaces validation
    const spacePassword = result.current.validatePassword(
      "password with space",
      "password with space"
    );
    expect(spacePassword.isValid).toBe(false);
    expect(spacePassword.error).toContain("cannot contain spaces");

    // Test password mismatch
    const mismatchPassword = result.current.validatePassword(
      "password123",
      "different123"
    );
    expect(mismatchPassword.isValid).toBe(false);
    expect(mismatchPassword.error).toContain("do not match");

    // Test valid password
    const validPassword = result.current.validatePassword(
      "password123",
      "password123"
    );
    expect(validPassword.isValid).toBe(true);
    expect(validPassword.error).toBeUndefined();
  });

  it("should reset password successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      const success = await result.current.resetPassword({
        code: "reset-code-123",
        password: "newpassword123",
        passwordConfirmation: "newpassword123",
      });
      expect(success).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:1339/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "reset-code-123",
          password: "newpassword123",
          passwordConfirmation: "newpassword123",
        }),
      }
    );

    expect(result.current.message.type).toBe("success");
    expect(result.current.message.text).toContain("Password reset successful");
  });

  it("should handle reset password validation errors", async () => {
    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      const success = await result.current.resetPassword({
        code: "reset-code-123",
        password: "short",
        passwordConfirmation: "short",
      });
      expect(success).toBe(false);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.message.type).toBe("error");
    expect(result.current.message.text).toContain("at least 8 characters");
  });

  it("should handle reset password request failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      const success = await result.current.resetPassword({
        code: "invalid-code",
        password: "newpassword123",
        passwordConfirmation: "newpassword123",
      });
      expect(success).toBe(false);
    });

    expect(result.current.message.type).toBe("error");
    expect(result.current.message.text).toContain("Failed to reset password");
  });

  it("should clear message when called", () => {
    const { result } = renderHook(() => useResetPassword());

    // Set an error message first
    act(() => {
      result.current.validatePassword("short", "short");
    });

    // Clear the message
    act(() => {
      result.current.clearMessage();
    });

    expect(result.current.message.type).toBe("neutral");
    expect(result.current.message.text).toBe("");
  });
});
