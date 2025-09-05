import { redirect } from "next/navigation";

export default function HomePage() {
  // For now, redirect to dashboard. In the future, this could show a landing page
  // or check authentication status to redirect to login/dashboard accordingly
  redirect("/dashboard");
}
