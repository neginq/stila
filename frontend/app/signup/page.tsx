"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignupErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  general?: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<SignupErrors>({});
  const [isLoading, setIsLoading] = useState(false);

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

    const newErrors: SignupErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "نام را وارد کنید.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "نام خانوادگی را وارد کنید.";
    }

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

      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobileNumber: phone,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({
            general: "این شماره موبایل قبلاً ثبت شده است.",
          });
        } else {
          setErrors({
            general: "ثبت‌نام انجام نشد. دوباره تلاش کنید.",
          });
        }

        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);

      setErrors({
        general: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-[#1c1e1e] px-4 py-3">
      <section className="mx-auto flex min-h-[calc(100svh-24px)] w-full max-w-6xl items-center justify-center">
        <div
          dir="ltr"
          className="flex w-full flex-col items-center justify-center lg:min-h-[650px] lg:flex-row"
        >
          {/* Signup form */}
          <div
            dir="rtl"
            className="relative z-10 w-full max-w-[560px] lg:flex-none"
          >
            <Link
              href="/"
              className="mb-2 block text-center font-serif text-5xl italic text-[#c886e5] transition hover:text-[#dba6ef]"
            >
              Stila
            </Link>

            <div className="w-full rounded-[38px] bg-gradient-to-br from-[#d6a0ed] via-[#ca8de5] to-[#bd7cda] px-7 py-6 text-[#241b28] shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:px-11">
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                {/* First name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 flex items-center gap-2 text-lg font-bold"
                  >
                    <UserIcon />
                    <span>نام</span>
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);

                      if (errors.firstName) {
                        setErrors((previous) => ({
                          ...previous,
                          firstName: undefined,
                        }));
                      }
                    }}
                    className={`w-full border-b-2 bg-transparent px-1 py-2 text-lg outline-none transition ${
                      errors.firstName
                        ? "border-red-700"
                        : "border-[#512660] focus:border-[#7d3b96]"
                    }`}
                  />

                  {errors.firstName && (
                    <p className="mt-1 text-sm font-medium text-red-800">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 flex items-center gap-2 text-lg font-bold"
                  >
                    <UserIcon />
                    <span>نام خانوادگی</span>
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value);

                      if (errors.lastName) {
                        setErrors((previous) => ({
                          ...previous,
                          lastName: undefined,
                        }));
                      }
                    }}
                    className={`w-full border-b-2 bg-transparent px-1 py-2 text-lg outline-none transition ${
                      errors.lastName
                        ? "border-red-700"
                        : "border-[#512660] focus:border-[#7d3b96]"
                    }`}
                  />

                  {errors.lastName && (
                    <p className="mt-1 text-sm font-medium text-red-800">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 flex items-center gap-2 text-lg font-bold"
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
                    className={`w-full border-b-2 bg-transparent px-1 py-2 text-left text-lg outline-none transition placeholder:text-[#744780] ${
                      errors.phone
                        ? "border-red-700"
                        : "border-[#512660] focus:border-[#7d3b96]"
                    }`}
                  />

                  {errors.phone && (
                    <p className="mt-1 text-sm font-medium text-red-800">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 flex items-center gap-2 text-lg font-bold"
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
                      autoComplete="new-password"
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
                      className="w-full bg-transparent px-1 py-2 text-left text-lg outline-none"
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

                {/* Backend error */}
                {errors.general && (
                  <p className="rounded-xl bg-red-100/70 px-4 py-2 text-center text-sm font-medium text-red-800">
                    {errors.general}
                  </p>
                )}

                {/* Submit */}
                <div className="pt-3 text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="min-w-52 cursor-pointer rounded-full bg-gradient-to-l from-[#7f3f9e] via-[#984db7] to-[#ad67ca] px-10 py-3 text-lg font-bold text-white shadow-[0_10px_25px_rgba(105,45,135,0.35)] transition duration-200 hover:scale-[1.03] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "در حال ثبت‌نام..." : "ثبت نام"}
                  </button>
                </div>
              </form>

              <p className="mt-4 text-center">
                حساب کاربری دارید؟{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#57246c] transition hover:text-[#361243]"
                >
                  ورود
                </Link>
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden h-[590px] w-[58%] max-w-[720px] flex-none overflow-hidden rounded-[42px] lg:-ml-20 lg:block">
            <img
              src="/images/login.jpg"
              alt="تصویر اتاق لباس و آینه"
              className="h-full w-full scale-[1.1] object-cover object-left"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/5 via-transparent to-black/20" />
          </div>
        </div>
      </section>
    </main>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 fill-none stroke-current stroke-2"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
    </svg>
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
