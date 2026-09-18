"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

type UserProfileResponse = {
  id: number;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  gender: string;
  ageGroup: string;
  createdAt: string;
  styleProfile: {
    skinTone: string;
    skinUndertone: string;
    bodyShape: string;
    favoriteStyles: string[];
    favoriteColorPalettes: string[];
    dislikedColors: string[];
  } | null;
};

export default function Home() {
  const router = useRouter();

  const { token, isLoggedIn, isAuthReady, logout } = useAuth();

  const [isStarting, setIsStarting] = useState(false);

  const [startError, setStartError] = useState("");

  async function handleStart() {
    if (!isAuthReady) {
      return;
    }

    // کاربر هنوز وارد نشده است
    if (!isLoggedIn || !token) {
      router.push("/login");
      return;
    }

    const authToken = token;

    try {
      setIsStarting(true);
      setStartError("");

      /*
        از Backend پروفایل کاربر فعلی را می‌گیریم.
        token مشخص می‌کند این درخواست متعلق به کدام کاربر است.
      */
      const response = await fetch("http://localhost:5000/user/profile", {
        method: "GET",

        headers: {
          Authorization: authToken,
        },
      });

      /*
        اگر token معتبر نباشد،
        کاربر را logout می‌کنیم
        و دوباره به Login می‌فرستیم.
      */
      if (response.status === 401) {
        logout();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setStartError("دریافت اطلاعات پروفایل انجام نشد. دوباره تلاش کنید.");

        return;
      }

      const profile: UserProfileResponse = await response.json();

      /*
        اگر هنوز Style Profile ندارد،
        باید ابتدا 8 سؤال ثابت را پاسخ دهد.
      */
      if (profile.styleProfile === null) {
        router.push("/profile/setup?next=questions");
        return;
      }

      /*
        Profile قبلاً تکمیل شده است.
        پس مستقیماً سراغ 7 سؤال درخواست امروز می‌رویم.
      */
      router.push("/questions");
    } catch (error) {
      console.error("Profile check error:", error);

      setStartError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setIsStarting(false);
    }
  }

  function handleLogout() {
    /*
      authToken از localStorage حذف می‌شود
      و token داخل AuthContext هم null می‌شود.
    */
    logout();

    /*
      چون همین حالا روی Home هستیم،
      فقط state جدید AuthContext باعث می‌شود
      Header از پروفایل/خروج به ورود تغییر کند.
    */
    setStartError("");
  }

  return (
    <main className="min-h-screen bg-[#1c1e1e] text-white">
      {/* Header */}
      <header className="flex h-20 items-center justify-between bg-[#af7fcb] px-6 md:px-12">
        {/* Logo */}
        <Image
          src="/images/logo.png"
          alt="لوگوی Stila"
          width={120}
          height={120}
          priority
          className="h-auto w-24"
        />

        <h1 className="font-serif text-4xl italic text-[#241b28]">Stila</h1>

        {/* Auth actions */}
        {!isAuthReady ? (
          <div className="h-11 w-40" />
        ) : isLoggedIn ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="rounded-xl bg-[#80479f] px-5 py-3 text-sm text-white transition hover:bg-[#713c91]"
            >
              پروفایل
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#633478]/30 bg-[#c69adb]/50 px-5 py-3 text-sm font-medium text-[#38223f] transition hover:bg-[#d2ace3]"
            >
              خروج
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-xl bg-[#80479f] px-6 py-3 text-sm text-white transition hover:bg-[#713c91]"
          >
            ورود
          </Link>
        )}
      </header>

      {/* Hero section */}
      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-6xl flex-col items-center justify-center px-5 py-10 sm:px-8 md:py-14">
        <div className="flex w-full flex-col items-center gap-10 rounded-[32px] bg-[#cf9be6] px-6 py-8 text-[#241b28] shadow-lg sm:px-10 md:flex-row md:justify-between md:gap-14 md:rounded-[40px] md:px-14 md:py-12">
          {/* Text */}
          <div className="w-full flex-1 text-center md:text-right">
            <h2 className="text-2xl font-bold leading-[1.8] sm:text-3xl md:text-4xl">
              بهترین استایل خودت را پیدا کن
            </h2>

            <p className="text-lg leading-8 text-[#704184] sm:text-xl md:mr-8 md:text-2xl">
              استایلیست شخصی خودت را همیشه همراه داشته باش
            </p>
          </div>

          {/* Image */}
          <div className="flex w-full justify-center md:w-auto md:flex-none">
            <div className="overflow-hidden rounded-[28px] bg-[#c18adb] p-3 shadow-md sm:p-4">
              <Image
                src="/images/home.jpg"
                alt="تصویر دستیار انتخاب استایل"
                width={320}
                height={320}
                priority
                className="h-56 w-56 rounded-[20px] object-cover sm:h-64 sm:w-64 md:h-60 md:w-60 lg:h-64 lg:w-64"
              />
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-10 text-center md:mt-12">
          <p className="mb-7 text-xl text-[#d09ae8] sm:text-2xl">
            آماده‌ای برای اوت‌فیت امروز؟
          </p>

          <button
            type="button"
            onClick={handleStart}
            disabled={!isAuthReady || isStarting}
            className="inline-flex min-w-36 items-center justify-center rounded-full bg-[#9b5fbd] px-10 py-4 font-medium text-white transition duration-200 hover:scale-105 hover:bg-[#ad6dcc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isStarting ? "در حال بررسی..." : "شروع"}
          </button>

          {startError && (
            <p className="mt-4 text-sm font-medium text-red-300">
              {startError}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
