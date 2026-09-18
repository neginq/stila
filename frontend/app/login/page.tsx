"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type LoginErrors = {
  phone?: string;
  password?: string;
  general?: string;
};
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  function validatePhone(phoneNumber: string) {
    return /^09\d{9}$/.test(phoneNumber);
  }

  function handlePhoneChange(value: string) {
    const numericValue = value.replace(/\D/g, "").slice(0, 11);
    setPhone(numericValue);

    if (errors.phone) {
      setErrors((previous) => ({
        ...previous,
        phone: undefined,
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors: LoginErrors = {};

    if (!validatePhone(phone)) {
      newErrors.phone = "شماره موبایل معتبر نیست؛ مانند 09123456789 وارد کنید.";
    }

    if (password.trim().length < 6) {
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNumber: phone,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({
            general: "شماره موبایل یا رمز عبور اشتباه است.",
          });
        } else {
          setErrors({
            general: "خطایی در ورود رخ داد. دوباره تلاش کنید.",
          });
        }

        return;
      }

      const data = await response.json();

      login(data.token);

      router.push("/");
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        general: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[100svh] overflow-hidden bg-[#1c1e1e] px-4 py-5">
      <section className="mx-auto flex min-h-[calc(100svh-40px)] w-full max-w-6xl items-center justify-center">
        <div className="relative flex w-full items-center justify-center lg:min-h-[620px]">
          {/* Image - سمت راست */}
          <div className="relative hidden h-[520px] w-[58%] overflow-hidden rounded-[42px] lg:block">
            <img
              src="/images/login.jpg"
              alt="تصویر اتاق لباس و آینه"
              className="h-full w-full scale-[1.08] object-cover object-left"
            />

            {/* لایه خیلی ملایم برای هماهنگی رنگ */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/5 via-transparent to-black/20" />
          </div>

          {/* Login form - سمت چپ و کمی روی عکس */}
          <div className="relative z-10 w-full max-w-lg lg:-mr-28">
            <Link
              href="/"
              className="mb-4 block text-center font-serif text-5xl italic text-[#c886e5] transition hover:text-[#dba6ef]"
            >
              Stila
            </Link>

            <div className="rounded-[34px] bg-gradient-to-br from-[#d8a4ef] via-[#cb8de5] to-[#bc78d8] px-7 py-8 text-[#241b28] shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-10">
              <form
                onSubmit={handleSubmit}
                noValidate
                autoComplete="on"
                className="space-y-6"
              >
                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 flex items-center gap-2 text-lg font-bold"
                  >
                    <PhoneIcon />
                    <span>شماره موبایل</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(event) => handlePhoneChange(event.target.value)}
                    placeholder="09123456789"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? "login-phone-error" : undefined
                    }
                    className={`w-full border-b-2 bg-transparent px-1 py-2.5 text-left text-lg outline-none transition placeholder:text-[#71447f] ${
                      errors.phone
                        ? "border-red-700"
                        : "border-[#512660] focus:border-[#7d3b96]"
                    }`}
                  />

                  {errors.phone && (
                    <p
                      id="login-phone-error"
                      className="mt-1 text-sm font-medium text-red-800"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 flex items-center gap-2 text-lg font-bold"
                  >
                    <KeyIcon />
                    <span>رمز عبور</span>
                  </label>

                  <div
                    className={`flex items-center border-b-2 transition ${
                      errors.password
                        ? "border-red-700"
                        : "border-[#512660] focus-within:border-[#7d3b96]"
                    }`}
                  >
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      dir="ltr"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);

                        if (errors.password) {
                          setErrors((previous) => ({
                            ...previous,
                            password: undefined,
                          }));
                        }
                      }}
                      className="w-full bg-transparent px-1 py-2.5 text-left text-lg outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={
                        showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
                      }
                      className="mr-2 cursor-pointer rounded-lg p-1 transition hover:bg-black/10"
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1 text-sm font-medium text-red-800">
                      {errors.password}
                    </p>
                  )}
                </div>
                {errors.general && (
                  <p className="rounded-xl bg-red-100/70 px-4 py-2 text-center text-sm font-medium text-red-800">
                    {errors.general}
                  </p>
                )}
                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-full bg-gradient-to-l from-[#7f3f9e] via-[#984db7] to-[#ad67ca] px-8 py-3.5 text-lg font-bold text-white shadow-[0_10px_25px_rgba(105,45,135,0.35)] transition duration-200 hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "در حال ورود..." : "ورود"}
                </button>
              </form>

              <p className="mt-6 text-center">
                حساب کاربری ندارید؟{" "}
                <Link
                  href="/signup"
                  className="font-bold text-[#56226b] transition hover:text-[#351142]"
                >
                  ثبت نام
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 fill-none stroke-current stroke-2"
    >
      <path d="M7 3h3l2 5-2 2c1.5 3 3 4.5 6 6l2-2 5 2v3c0 1-1 2-2 2C11 21 3 13 3 5c0-1 1-2 2-2h2Z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 fill-none stroke-current stroke-2"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8 2 2-2 2 2 2-3 3-2-2-3 3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-none stroke-current stroke-2"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-none stroke-current stroke-2"
    >
      <path d="m3 3 18 18" />
      <path d="M10.5 5.2A11 11 0 0 1 12 5c6 0 10 7 10 7a15 15 0 0 1-2.1 3" />
      <path d="M6.2 6.2C3.6 8 2 12 2 12s4 7 10 7a9 9 0 0 0 3.8-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
