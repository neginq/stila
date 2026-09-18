"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { questions } from "@/data/questions";

import { useAuth } from "@/context/AuthContext";

import {
  mapBackendProfileToAnswers,
  type BackendUserProfile,
} from "@/utils/profileResponseMapper";

import type { QuestionnaireAnswers } from "@/types/questionnaire";

type HistoryOutfitItem = {
  slot: string;
  colorFamily: string;
  isOwnedReuse: boolean;

  clothingItem: {
    id: number;
    slug: string;
    nameEn: string;
    nameFa: string;
    itemType: string;
    fit: string;
    formality: string;
    coverage: string | null;
    novelty: string;
  };
};

type HistoryOutfit = {
  rank: number;
  intent: "BEST_MATCH" | "ALTERNATIVE" | "ADVENTUROUS";
  score: number;
  noveltyLevel: string;
  explanation: string;
  items: HistoryOutfitItem[];
};

type RecommendationHistoryItem = {
  requestId: number;
  createdAt: string;
  occasion: string;
  season: string;
  fitPreference: string;
  coverageLevel: string | null;
  formalityLevel: string | null;
  wardrobePalette: string;
  wardrobeItems: string[];
  explorationLevel: string;
  outfits: HistoryOutfit[];
};

type RecommendationHistoryResponse = {
  total: number;
  limit: number;
  offset: number;
  items: RecommendationHistoryItem[];
};

const occasionLabels: Record<string, string> = {
  DAILY: "روزمره",
  UNIVERSITY: "دانشگاه",
  WORK: "محل کار",
  FRIENDS_GATHERING: "دورهمی دوستانه",
  PARTY: "مهمانی",
  DATE_CAFE: "قرار یا کافه",
  FORMAL_EVENT: "مراسم رسمی",
  TRAVEL: "سفر و گردش",
};

const seasonLabels: Record<string, string> = {
  SPRING: "بهار",
  SUMMER: "تابستان",
  FALL: "پاییز",
  WINTER: "زمستان",
  ALL_SEASON: "چهارفصل",
};

export default function ProfilePage() {
  const router = useRouter();

  const { token, isAuthReady, isLoggedIn, logout } = useAuth();

  const [userProfile, setUserProfile] = useState<BackendUserProfile | null>(
    null,
  );

  const [profileAnswers, setProfileAnswers] =
    useState<QuestionnaireAnswers | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [recommendationHistory, setRecommendationHistory] = useState<
    RecommendationHistoryItem[]
  >([]);

  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isLoggedIn || !token) {
      router.push("/login");
      return;
    }

    const authToken = token;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await fetch("http://localhost:5000/user/profile", {
          method: "GET",
          headers: {
            Authorization: authToken,
          },
        });

        if (response.status === 401) {
          logout();
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setLoadError(
            "دریافت اطلاعات پروفایل انجام نشد. لطفاً دوباره تلاش کنید.",
          );
          return;
        }

        const data: BackendUserProfile = await response.json();

        setUserProfile(data);

        const mappedAnswers = mapBackendProfileToAnswers(data);

        setProfileAnswers(mappedAnswers);

        try {
          setIsHistoryLoading(true);
          setHistoryError("");

          const historyResponse = await fetch(
            "http://localhost:5000/recommend/history?limit=5&offset=0",
            {
              method: "GET",
              headers: {
                Authorization: authToken,
              },
            },
          );

          if (historyResponse.status === 401) {
            logout();
            router.push("/login");
            return;
          }

          if (!historyResponse.ok) {
            setHistoryError("دریافت تاریخچه پیشنهادها انجام نشد.");
            return;
          }

          const historyData: RecommendationHistoryResponse =
            await historyResponse.json();

          setRecommendationHistory(historyData.items);
        } catch (error) {
          console.error("Could not load recommendation history:", error);

          setHistoryError("ارتباط با سرور برای دریافت تاریخچه برقرار نشد.");
        } finally {
          setIsHistoryLoading(false);
        }
      } catch (error) {
        console.error("Could not load profile:", error);

        setLoadError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [isAuthReady, isLoggedIn, token, router, logout]);

  function getAnswerLabels(questionId: string) {
    if (!profileAnswers) {
      return [];
    }

    const selectedValues = profileAnswers[questionId] ?? [];

    const question = questions.find((item) => item.id === questionId);

    if (!question) {
      return selectedValues;
    }

    return selectedValues.map((value) => {
      const option = question.options.find((item) => item.value === value);

      return option?.label ?? value;
    });
  }

  function handleOpenRecommendation(item: RecommendationHistoryItem) {
    const recommendation = {
      requestId: item.requestId,
      createdAt: item.createdAt,
      outfits: item.outfits,
    };

    sessionStorage.setItem(
      "latestRecommendation",
      JSON.stringify(recommendation),
    );

    router.push("/recommendation");
  }

  if (!isAuthReady || isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#191b1d] text-white">
        <p className="text-white/70">در حال بارگذاری پروفایل...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#191b1d] px-4 text-white">
        <div className="w-full max-w-lg rounded-[32px] border border-red-400/20 bg-[#2a232e] p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
          <h1 className="mb-3 text-2xl font-bold text-[#ebc6f5]">
            خطا در دریافت پروفایل
          </h1>

          <p className="mb-7 leading-7 text-white/55">{loadError}</p>

          <Link
            href="/"
            className="inline-flex rounded-full bg-gradient-to-l from-[#71368d] via-[#914ab0] to-[#b05fc9] px-7 py-3 font-bold text-white transition hover:brightness-110"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </main>
    );
  }

  if (!userProfile || !profileAnswers) {
    return null;
  }

  if (!userProfile.styleProfile) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#191b1d] px-4 text-white">
        <div className="w-full max-w-lg rounded-[32px] border border-[#b66fd1]/20 bg-[#2a232e] p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b66fd1]/15 text-3xl text-[#d59be8]">
            ✦
          </div>

          <h1 className="mb-3 text-2xl font-bold text-[#ebc6f5]">
            پروفایل استایل شما هنوز کامل نشده
          </h1>

          <p className="mb-7 leading-7 text-white/55">
            برای دریافت پیشنهادهای شخصی‌سازی‌شده، ابتدا اطلاعات استایل خود را
            تکمیل کنید.
          </p>

          <Link
            href="/profile/setup"
            className="inline-flex rounded-full bg-gradient-to-l from-[#71368d] via-[#914ab0] to-[#b05fc9] px-7 py-3 font-bold text-white shadow-[0_10px_30px_rgba(128,62,155,0.3)] transition hover:scale-[1.02] hover:brightness-110"
          >
            تکمیل پروفایل
          </Link>
        </div>
      </main>
    );
  }

  const selectedGender = profileAnswers.gender?.[0];

  const gender = getAnswerLabels("gender");

  const ageGroup = getAnswerLabels("age_group");

  const skinTone = getAnswerLabels("skin_tone");

  const skinUndertone = getAnswerLabels("skin_undertone");

  const femaleBodyShape = getAnswerLabels("female_body_shape");

  const maleBodyShape = getAnswerLabels("male_body_shape");

  const bodyShape =
    femaleBodyShape.length > 0 ? femaleBodyShape : maleBodyShape;

  const favoriteStyles =
    selectedGender === "female"
      ? getAnswerLabels("female_style_preferences")
      : getAnswerLabels("male_style_preferences");

  const favoriteColorPalettes =
    selectedGender === "female"
      ? getAnswerLabels("female_favorite_color_palettes")
      : getAnswerLabels("male_favorite_color_palettes");

  const dislikedColors = getAnswerLabels("colors_disliked");

  return (
    <main
      dir="rtl"
      className="min-h-svh bg-[#191b1d] px-4 py-8 text-white sm:px-6"
    >
      <section className="mx-auto w-full max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-4xl italic text-[#ce88e5] transition hover:text-[#e1b0ef] sm:text-5xl"
          >
            Stila
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm text-white/75 transition hover:border-[#b96bd4]/50 hover:bg-[#b96bd4]/10 hover:text-[#e0b0ef]"
          >
            صفحه اصلی
          </Link>
        </header>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#efc9f7] sm:text-4xl">
            پروفایل من
          </h1>
        </div>

        <section className="mb-8 overflow-hidden rounded-[34px] border border-[#b96bd4]/15 bg-gradient-to-br from-[#29252d] via-[#252428] to-[#212326] shadow-[0_22px_55px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 border-b border-white/8 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-2xl font-bold text-[#e4b7ef]">
                اطلاعات حساب
              </h2>

              <p className="mt-1 text-sm text-white/45">
                اطلاعات پایه‌ای که هنگام ثبت‌نام وارد کرده‌اید
              </p>
            </div>

            <span className="w-fit rounded-full border border-[#c77ddd]/25 bg-[#b96bd4]/10 px-4 py-2 text-sm text-[#dca7ed]">
              حساب کاربری
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AccountItem title="نام" value={userProfile.firstName} />

              <AccountItem title="نام خانوادگی" value={userProfile.lastName} />

              <AccountItem
                title="شماره موبایل"
                value={userProfile.mobileNumber}
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[36px] border border-[#d49ae6]/20 bg-gradient-to-br from-[#c887df] via-[#bd78d5] to-[#a963c2] text-[#281b2d] shadow-[0_28px_65px_rgba(97,42,121,0.25)]">
          <div className="flex flex-col gap-5 border-b border-[#6f327f]/20 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-2xl font-bold">پروفایل استایل</h2>

              <p className="mt-1 text-sm text-[#563260]/80">
                ویژگی‌ها و ترجیحاتی که پیشنهادهای استایل بر اساس آن‌ها شخصی‌سازی
                می‌شوند
              </p>
            </div>

            <Link
              href="/profile/setup"
              className="inline-flex w-fit shrink-0 items-center justify-center rounded-full bg-[#633078] px-6 py-3 font-bold text-white shadow-[0_8px_20px_rgba(75,28,91,0.25)] transition hover:scale-[1.02] hover:bg-[#542467]"
            >
              ویرایش پروفایل استایل
            </Link>
          </div>

          <div className="p-6 sm:p-8">
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-[#67327d]" />

                <div>
                  <h3 className="text-xl font-bold">ویژگی‌های شخصی</h3>

                  <p className="mt-1 text-sm text-[#5e396a]/75">
                    اطلاعات پایه برای شخصی‌سازی استایل
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ProfileItem title="جنسیت" values={gender} />

                <ProfileItem title="گروه سنی" values={ageGroup} />

                <ProfileItem title="رنگ پوست" values={skinTone} />

                <ProfileItem title="ته‌رنگ پوست" values={skinUndertone} />

                <ProfileItem title="فرم بدن" values={bodyShape} />
              </div>
            </section>

            <div className="my-8 border-t border-[#6c337e]/20" />

            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-[#67327d]" />

                <div>
                  <h3 className="text-xl font-bold">سلیقه و ترجیحات استایل</h3>

                  <p className="mt-1 text-sm text-[#5e396a]/75">
                    رنگ‌ها و سبک‌هایی که بیشتر به آن‌ها علاقه دارید
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <ProfileItem
                  title="سبک‌های مورد علاقه"
                  values={favoriteStyles}
                />

                <ProfileItem
                  title="خانواده‌های رنگی مورد علاقه"
                  values={favoriteColorPalettes}
                />

                <ProfileItem title="رنگ‌های نامطلوب" values={dislikedColors} />
              </div>
            </section>
          </div>
        </section>

        {/* Recommendation History */}
        <section className="mt-8 overflow-hidden rounded-[34px] border border-[#b96bd4]/15 bg-gradient-to-br from-[#29252d] via-[#252428] to-[#212326] shadow-[0_22px_55px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-3 border-b border-white/8 px-6 py-6 sm:px-8">
            <h2 className="text-2xl font-bold text-[#e4b7ef]">
              تاریخچه پیشنهادها
            </h2>

            <p className="text-sm text-white/45">
              آخرین استایل‌هایی که Stila برای شما ساخته است
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {isHistoryLoading ? (
              <p className="text-sm text-white/50">
                در حال دریافت تاریخچه پیشنهادها...
              </p>
            ) : historyError ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-5">
                <p className="text-sm text-red-200/80">{historyError}</p>
              </div>
            ) : recommendationHistory.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b96bd4]/15 text-xl">
                  ✨
                </div>

                <h3 className="font-bold text-[#e5b8f0]">
                  هنوز پیشنهادی ثبت نشده
                </h3>

                <p className="mt-2 text-sm leading-7 text-white/45">
                  بعد از دریافت اولین پیشنهاد استایل، می‌توانید آن را از اینجا
                  دوباره مشاهده کنید.
                </p>

                <Link
                  href="/questions"
                  className="mt-5 inline-flex rounded-full bg-[#82429c] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#914cae]"
                >
                  دریافت پیشنهاد
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendationHistory.map((item) => (
                  <article
                    key={item.requestId}
                    className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-[#c47ddd]/30 hover:bg-white/[0.07]"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#dda7eb]">
                          {occasionLabels[item.occasion] ?? item.occasion}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {seasonLabels[item.season] ?? item.season}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/45">
                        {item.outfits.length} پیشنهاد
                      </span>
                    </div>

                    <p className="mb-5 text-xs text-white/35">
                      {new Date(item.createdAt).toLocaleDateString("fa-IR")}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleOpenRecommendation(item)}
                      className="w-full rounded-xl bg-[#7e3e97] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#914aab]"
                    >
                      مشاهده پیشنهادها
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

type AccountItemProps = {
  title: string;
  value: string;
};

function AccountItem({ title, value }: AccountItemProps) {
  return (
    <div className="rounded-3xl border border-[#c37bd9]/12 bg-gradient-to-br from-white/[0.07] to-white/[0.035] p-5 transition hover:border-[#c37bd9]/25 hover:bg-white/[0.08]">
      <p className="mb-3 text-sm font-bold text-[#d7a0e7]">{title}</p>

      <p className="text-sm leading-6 text-white/65">{value}</p>
    </div>
  );
}

type ProfileItemProps = {
  title: string;
  values: string[];
};

function ProfileItem({ title, values }: ProfileItemProps) {
  return (
    <div className="min-h-28 rounded-3xl border border-[#72368a]/20 bg-white/20 p-5 shadow-[0_8px_20px_rgba(91,45,105,0.08)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/25">
      <p className="mb-3 text-sm font-bold text-[#62366e]">{title}</p>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full border border-white/40 bg-white/55 px-3 py-1.5 text-sm font-bold text-[#38233f] shadow-sm"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#694676]">ثبت نشده</p>
      )}
    </div>
  );
}
