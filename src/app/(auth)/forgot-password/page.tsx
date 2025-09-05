"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
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
import { useForgotPassword } from "@/shared/hooks/use-password-reset";
import { useAuthContext } from "@/shared/contexts/auth-context";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { sendForgotPassword, isLoading, message } = useForgotPassword();
  const { userAuth } = useAuthContext();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (userAuth.initialized && userAuth.isAuth) {
      router.push("/dashboard");
    }
  }, [userAuth.initialized, userAuth.isAuth, router]);

  // Don't render if already authenticated
  if (userAuth.isAuth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !email.trim()) return;

    await sendForgotPassword(email.trim());
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
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Please insert your registration email and click on Send button.
              You'll receive an email with instructions on how to reset your
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Your Registration Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {renderMessage()}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
