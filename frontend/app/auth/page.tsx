"use client";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  // AuthForm now handles redirect internally after success
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
  <AuthForm />
    </div>
  );
}
