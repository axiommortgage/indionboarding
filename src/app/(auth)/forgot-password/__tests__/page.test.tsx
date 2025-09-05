import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import ForgotPasswordPage from "../page";
import { useForgotPassword } from "@/shared/hooks/use-password-reset";
import { useAuthContext } from "@/shared/contexts/auth-context";

// Mock the hooks
jest.mock("@/shared/hooks/use-password-reset");
jest.mock("@/shared/contexts/auth-context");
jest.mock("next/navigation");

const mockUseForgotPassword = useForgotPassword as jest.MockedFunction<
  typeof useForgotPassword
>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockPush = jest.fn();

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
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

    mockUseForgotPassword.mockReturnValue({
      sendForgotPassword: jest.fn(),
      isLoading: false,
      message: { type: "neutral", text: "" },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders forgot password form correctly", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(
      screen.getByText(/Please insert your registration email/)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Your Registration Email")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(screen.getByText("Back to login")).toBeInTheDocument();
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

    render(<ForgotPasswordPage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("submits form with email", async () => {
    const mockSendForgotPassword = jest.fn().mockResolvedValue(true);
    mockUseForgotPassword.mockReturnValue({
      sendForgotPassword: mockSendForgotPassword,
      isLoading: false,
      message: { type: "neutral", text: "" },
    });

    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText("Your Registration Email");
    const submitButton = screen.getByRole("button", { name: "Send" });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    expect(mockSendForgotPassword).toHaveBeenCalledWith("test@example.com");
  });

  it("shows loading state when submitting", () => {
    mockUseForgotPassword.mockReturnValue({
      sendForgotPassword: jest.fn(),
      isLoading: true,
      message: { type: "neutral", text: "" },
    });

    render(<ForgotPasswordPage />);

    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled();
  });

  it("shows success message", () => {
    mockUseForgotPassword.mockReturnValue({
      sendForgotPassword: jest.fn(),
      isLoading: false,
      message: {
        type: "success",
        text: "Success! Within 10 minutes you will receive an email with instructions to reset your password.",
      },
    });

    render(<ForgotPasswordPage />);

    expect(screen.getByText(/Success! Within 10 minutes/)).toBeInTheDocument();
  });

  it("shows error message", () => {
    mockUseForgotPassword.mockReturnValue({
      sendForgotPassword: jest.fn(),
      isLoading: false,
      message: {
        type: "error",
        text: "Ooops! The informed email doesn't exist in our database.",
      },
    });

    render(<ForgotPasswordPage />);

    expect(
      screen.getByText(/doesn't exist in our database/)
    ).toBeInTheDocument();
  });

  it("disables submit button when email is empty", () => {
    render(<ForgotPasswordPage />);

    const submitButton = screen.getByRole("button", { name: "Send" });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when email is provided", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText("Your Registration Email");
    const submitButton = screen.getByRole("button", { name: "Send" });

    await user.type(emailInput, "test@example.com");
    expect(submitButton).not.toBeDisabled();
  });

  it("navigates to login page when clicking back link", () => {
    render(<ForgotPasswordPage />);

    const backLink = screen.getByText("Back to login");
    expect(backLink).toHaveAttribute("href", "/login");
  });
});
