"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  const { isAuthReady, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isAuthReady, isLoggedIn, router]);

  if (!isAuthReady) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#191b1d] text-white">
        <p className="text-white/70">در حال بررسی حساب کاربری...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return children;
}
