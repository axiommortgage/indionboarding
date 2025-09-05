import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import ResetPasswordPage from "../page";
import { useResetPassword } from "@/shared/hooks/use-password-reset";
import { useAuthContext } from "@/shared/contexts/auth-context";

// Mock the hooks
jest.mock("@/shared/hooks/use-password-reset");
jest.mock("@/shared/contexts/auth-context");
jest.mock("next/navigation");

const mockUseResetPassword = useResetPassword as jest.MockedFunction<
  typeof useResetPassword
>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;

const mockPush = jest.fn();
const mockGet = jest.fn();

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    mockUseSearchParams.mockReturnValue({
      get: mockGet,
    } as any);

    mockUseAuthContext.mockReturnValue({
      userAuth: {
        isAuth: false,
        initialized: true,
        userInfo: null,
        notifications: [],
        onePages: [],
        error: null,
      },
      setUserAuth: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshUserData: jest.fn(),
    } as any);

    mockUseResetPassword.mockReturnValue({
      resetPassword: jest.fn(),
      validatePassword: jest.fn(),
      clearMessage: jest.fn(),
      isLoading: false,
      message: { type: "neutral", text: "" },
    });

    // Mock reset code in URL
    mockGet.mockReturnValue("reset-code-123");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders reset password form correctly", () => {
    render(<ResetPasswordPage />);

    // Check that "Reset Password" appears (both in title and button)
    const resetPasswordElements = screen.getAllByText("Reset Password");
    expect(resetPasswordElements).toHaveLength(2); // title and button

    expect(
      screen.getByText("Insert and confirm your new password.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset Password" })
    ).toBeInTheDocument();
    expect(screen.getByText("Back to forgot password")).toBeInTheDocument();
  });

  it("shows password requirements", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText("Required:")).toBeInTheDocument();
    expect(
      screen.getByText("• Be at least 8 characters long")
    ).toBeInTheDocument();
    expect(screen.getByText("• No spaces")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Consider including at least one of the following (optional):"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("• Lowercase letter")).toBeInTheDocument();
    expect(screen.getByText("• Uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("• Number")).toBeInTheDocument();
    expect(screen.getByText("• Symbol")).toBeInTheDocument();
  });

  it("redirects to dashboard if user is authenticated", () => {
    mockUseAuthContext.mockReturnValue({
      userAuth: {
        isAuth: true,
        initialized: true,
        userInfo: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
        },
        notifications: [],
        onePages: [],
        error: null,
      },
      setUserAuth: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshUserData: jest.fn(),
    } as any);

    render(<ResetPasswordPage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects to forgot password if no code provided", () => {
    mockGet.mockReturnValue(null);

    render(<ResetPasswordPage />);

    expect(mockPush).toHaveBeenCalledWith("/forgot-password");
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    // Initially passwords should be hidden
    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    // Click show password buttons
    const showButtons = screen.getAllByRole("button", {
      name: /Show password/,
    });
    await user.click(showButtons[0]);
    await user.click(showButtons[1]);

    // Passwords should now be visible
    expect(newPasswordInput).toHaveAttribute("type", "text");
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
  });

  it("submits form with valid passwords", async () => {
    const mockResetPassword = jest.fn().mockResolvedValue(true);
    mockUseResetPassword.mockReturnValue({
      resetPassword: mockResetPassword,
      validatePassword: jest.fn(),
      clearMessage: jest.fn(),
      isLoading: false,
      message: { type: "neutral", text: "" },
    });

    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");
    await user.click(submitButton);

    expect(mockResetPassword).toHaveBeenCalledWith({
      code: "reset-code-123",
      password: "newpassword123",
      passwordConfirmation: "newpassword123",
    });
  });

  it("shows loading state when submitting", () => {
    mockUseResetPassword.mockReturnValue({
      resetPassword: jest.fn(),
      validatePassword: jest.fn(),
      clearMessage: jest.fn(),
      isLoading: true,
      message: { type: "neutral", text: "" },
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText("Resetting Password...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Resetting Password/ })
    ).toBeDisabled();
  });

  it("shows success message and redirects after 3 seconds", async () => {
    const mockResetPassword = jest.fn().mockResolvedValue(true);
    mockUseResetPassword.mockReturnValue({
      resetPassword: mockResetPassword,
      validatePassword: jest.fn(),
      clearMessage: jest.fn(),
      isLoading: false,
      message: {
        type: "success",
        text: "Password reset successful! You will be redirected to login...",
      },
    });

    // Mock setTimeout
    jest.useFakeTimers();

    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    render(<ResetPasswordPage />);

    // Fill out form
    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(newPasswordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    // Wait for the submit to be called
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalled();
    });

    expect(screen.getByText(/Password reset successful/)).toBeInTheDocument();

    // Fast-forward time to trigger setTimeout
    jest.runAllTimers();

    expect(mockPush).toHaveBeenCalledWith("/login");

    jest.useRealTimers();
  });

  it("shows error message", () => {
    mockUseResetPassword.mockReturnValue({
      resetPassword: jest.fn(),
      validatePassword: jest.fn(),
      clearMessage: jest.fn(),
      isLoading: false,
      message: {
        type: "error",
        text: "Passwords do not match. Please make sure both entries are identical",
      },
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
  });

  it("clears error message when typing in password fields", async () => {
    const mockClearMessage = jest.fn();
    mockUseResetPassword.mockReturnValue({
      resetPassword: jest.fn(),
      validatePassword: jest.fn(),
      clearMessage: mockClearMessage,
      isLoading: false,
      message: { type: "neutral", text: "" },
    });

    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText("New Password");
    await user.type(newPasswordInput, "t");

    expect(mockClearMessage).toHaveBeenCalled();
  });

  it("disables submit button when passwords are empty", () => {
    render(<ResetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when both passwords are provided", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    // Initially disabled
    expect(submitButton).toBeDisabled();

    await user.type(newPasswordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    // Should be enabled after typing
    expect(submitButton).not.toBeDisabled();
  });

  it("navigates to forgot password page when clicking back link", () => {
    render(<ResetPasswordPage />);

    const backLink = screen.getByText("Back to forgot password");
    expect(backLink).toHaveAttribute("href", "/forgot-password");
  });
});
