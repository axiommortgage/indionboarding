"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAuthContext } from "@/shared/contexts/auth-context";
import { clearAuthCookies } from "@/shared/lib/auth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClearTokens, setShowClearTokens] = useState(false);

  const { userAuth, login } = useAuthContext();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (userAuth.initialized && userAuth.isAuth) {
      router.push("/dashboard");
    }
  }, [userAuth.initialized, userAuth.isAuth, router]);

  // Check if there are old tokens that might need clearing
  useEffect(() => {
    const hasOldTokens = document.cookie.includes("jwt=");
    setShowClearTokens(
      (hasOldTokens && error.includes("405")) ||
        error.includes("Method Not Allowed")
    );
  }, [error]);

  // Don't render if already authenticated
  if (userAuth.isAuth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const success = await login(identifier, password);

      if (success) {
        router.push("/dashboard");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTokens = () => {
    clearAuthCookies();
    setShowClearTokens(false);
    setError("");
    window.location.reload();
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
                      <span className="text-2xl font-bold text-white">I</span>
                    </div>
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance">
                      Login to your IndiCentral account
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {/* Subtle clear tokens option, only shown when there's a 405 error */}
                  {showClearTokens && (
                    <div className="text-xs text-center">
                      <button
                        type="button"
                        onClick={handleClearTokens}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear old authentication data
                      </button>
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={identifier}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setIdentifier(e.target.value)
                      }
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="/forgot-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        disabled={isLoading}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </form>

              <div className="bg-muted relative hidden md:block">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-600">
                  <div className="text-center text-white p-8">
                    <h2 className="text-3xl font-bold mb-4">IndiCentral</h2>
                    <p className="text-xl opacity-90 mb-6">
                      Your source for brokerage
                      <br />
                      news, resources & more...
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm opacity-75">
                      <div>📊 Dashboard</div>
                      <div>📝 Resources</div>
                      <div>📧 Notifications</div>
                      <div>👥 Directory</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-muted-foreground text-center text-xs text-balance">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
