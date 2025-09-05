"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { useResetPassword } from "@/shared/hooks/use-password-reset";
import { useAuthContext } from "@/shared/contexts/auth-context";
import Link from "next/link";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword, clearMessage, isLoading, message } =
    useResetPassword();
  const { userAuth } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");

  // Redirect if already authenticated
  useEffect(() => {
    if (userAuth.initialized && userAuth.isAuth) {
      router.push("/dashboard");
    }
  }, [userAuth.initialized, userAuth.isAuth, router]);

  // Redirect if no code provided
  useEffect(() => {
    if (!code) {
      router.push("/forgot-password");
    }
  }, [code, router]);

  // Don't render if already authenticated or no code
  if (userAuth.isAuth || !code) {
    return null;
  }

  const handlePasswordChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    setter(value);
    clearMessage(); // Clear error message on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const success = await resetPassword({
      code,
      password: newPassword,
      passwordConfirmation: confirmPassword,
    });

    if (success) {
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  const renderMessage = () => {
    if (message.type === "neutral") return null;

    const isSuccess = message.type === "success";
    const Icon = isSuccess ? CheckCircle : AlertCircle;

    return (
      <Alert
        className={
          isSuccess
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }
      >
        <Icon
          className={`h-4 w-4 ${isSuccess ? "text-green-600" : "text-red-600"}`}
        />
        <AlertDescription
          className={isSuccess ? "text-green-800" : "text-red-800"}
        >
          {message.text}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg mx-auto">
              <span className="text-2xl font-bold text-white">I</span>
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Insert and confirm your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium mb-2">Required:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be at least 8 characters long</li>
                  <li>• No spaces</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  Consider including at least one of the following (optional):
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lowercase letter</li>
                  <li>• Uppercase letter</li>
                  <li>• Number</li>
                  <li>• Symbol</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) =>
                      handlePasswordChange(e.target.value, setNewPassword)
                    }
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="passwordConfirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange(e.target.value, setConfirmPassword)
                    }
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword
                        ? "Hide password confirmation"
                        : "Show password confirmation"}
                    </span>
                  </Button>
                </div>
              </div>

              {renderMessage()}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Back to forgot password
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
