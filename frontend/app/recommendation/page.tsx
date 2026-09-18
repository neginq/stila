"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type OutfitIntent = "BEST_MATCH" | "ALTERNATIVE" | "ADVENTUROUS";

type NoveltyLevel = "FAMILIAR" | "SLIGHTLY_NEW" | "MIXED" | "CREATIVE" | "BOLD";

type OutfitItem = {
  slot: string;
  colorFamily: string;
  isOwnedReuse: boolean;

  clothingItem: {
    id: number;
    nameFa: string;
    nameEn: string;
    itemType: string;
  };
};

type Outfit = {
  rank: number;
  intent: OutfitIntent;
  score: number;
  noveltyLevel: NoveltyLevel;
  explanation: string;
  items: OutfitItem[];
};

type RecommendationResponse = {
  requestId: number;
  createdAt: string;
  outfits: Outfit[];
};

const intentLabels: Record<
  OutfitIntent,
  {
    title: string;
    subtitle: string;
    icon: string;
  }
> = {
  BEST_MATCH: {
    title: "بهترین انتخاب",
    subtitle: "بیشترین هماهنگی با تو",
    icon: "✨",
  },

  ALTERNATIVE: {
    title: "انتخاب جایگزین",
    subtitle: "یک ترکیب متفاوت و مناسب",
    icon: "♡",
  },

  ADVENTUROUS: {
    title: "انتخاب جسورانه",
    subtitle: "یک پیشنهاد متفاوت‌تر",
    icon: "✦",
  },
};

const slotLabels: Record<string, string> = {
  TOP: "بالاتنه",
  BOTTOM: "پایین‌تنه",
  OUTERWEAR: "لایه بیرونی",
  SHOES: "کفش",
  ACCESSORY: "اکسسوری",
};

const slotIcons: Record<string, string> = {
  TOP: "👕",
  BOTTOM: "👖",
  OUTERWEAR: "🧥",
  SHOES: "👟",
  ACCESSORY: "⌚",
};

const colorLabels: Record<string, string> = {
  BLACK: "مشکی",
  WHITE_CREAM: "سفید و کرم",
  GRAY: "خاکستری",
  CREAM_BEIGE: "کرم و بژ",
  BROWN: "قهوه‌ای",
  NAVY: "سرمه‌ای",
  BLUE: "آبی",
  GREEN_OLIVE: "سبز و زیتونی",
  KHAKI_EARTH: "خاکی",
  RED_ORANGE: "قرمز و نارنجی",
  PINK: "صورتی",
  YELLOW: "زرد",
  PURPLE: "بنفش",
  PASTEL: "پاستلی",
  BRIGHT: "روشن و شاد",
  DARK: "تیره",
};

const colorSwatches: Record<string, string> = {
  BLACK: "#181818",
  WHITE_CREAM: "#eee8dc",
  GRAY: "#8b8b8b",
  CREAM_BEIGE: "#d6c09c",
  BROWN: "#76513d",
  NAVY: "#26374d",
  BLUE: "#6287ad",
  GREEN_OLIVE: "#778166",
  KHAKI_EARTH: "#9a8464",
  RED_ORANGE: "#c76d58",
  PINK: "#d997ad",
  YELLOW: "#d4b95a",
  PURPLE: "#8068a3",
  PASTEL: "#cbbdda",
  BRIGHT: "#df8e72",
  DARK: "#35333a",
};

export default function RecommendationPage() {
  const router = useRouter();

  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null);

  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  /*
    Response واقعی /recommend را می‌خوانیم.
  */
  useEffect(() => {
    try {
      const savedRecommendation = sessionStorage.getItem(
        "latestRecommendation",
      );

      if (!savedRecommendation) {
        setRecommendation(null);
        return;
      }

      const parsedRecommendation: RecommendationResponse =
        JSON.parse(savedRecommendation);

      setRecommendation(parsedRecommendation);
    } catch (error) {
      console.error("Could not read recommendation:", error);

      setRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#191b1d] text-white">
        <p className="text-white/60">در حال آماده‌سازی پیشنهادها...</p>
      </main>
    );
  }

  /*
    مثلاً کاربر مستقیم URL را باز کرده
    و هنوز Recommendation نساخته است.
  */
  if (!recommendation || recommendation.outfits.length === 0) {
    return (
      <main
        dir="rtl"
        className="flex min-h-svh items-center justify-center bg-[#191b1d] px-5 text-white"
      >
        <div className="w-full max-w-lg rounded-[30px] border border-[#c57ddd]/20 bg-[#242126] p-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b76bd2]/15">
            ✨
          </div>

          <h1 className="text-xl font-bold text-[#f0d4f7]">
            هنوز پیشنهادی آماده نشده
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/50">
            ابتدا چند سؤال کوتاه را پاسخ بده تا Stila استایل مناسب تو را پیدا
            کند.
          </p>

          <button
            type="button"
            onClick={() => router.push("/questions")}
            className="mt-6 rounded-xl bg-[#a45fc2] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#b56bd0]"
          >
            دریافت پیشنهاد
          </button>
        </div>
      </main>
    );
  }

  const selectedOutfit = recommendation.outfits[selectedOutfitIndex];

  const selectedIntent = intentLabels[selectedOutfit.intent];

  const itemGridClass =
    selectedOutfit.items.length >= 5
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <main dir="rtl" className="min-h-svh bg-[#191b1d] text-white">
      {/* Header */}
      <header className="bg-[#b47fd0]">
        <div className="grid h-20 w-full grid-cols-3 items-center px-5 sm:px-8 lg:px-12">
          {/* Logo */}
          <div className="flex justify-start">
            <Image
              src="/images/logo.png"
              alt="لوگوی Stila"
              width={120}
              height={120}
              priority
              className="h-auto w-20 sm:w-24"
            />
          </div>

          {/* Stila */}
          <Link
            href="/"
            className="justify-self-center font-serif text-4xl italic text-[#241b28]"
          >
            Stila
          </Link>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Link
              href="/"
              className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-[#2e1d35] transition hover:bg-white/30"
            >
              خانه
            </Link>

            <Link
              href="/profile"
              className="rounded-xl bg-[#7f429e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#71398f]"
            >
              پروفایل
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {/* Hero */}
        <section className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#bd70da]/20 text-base">
            ✨
          </div>

          <h1 className="text-2xl font-bold text-[#f3d9fa] sm:text-3xl lg:text-4xl">
            استایل‌های پیشنهادی برای تو
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            این پیشنهادها براساس پروفایل استایل، ترجیحات و انتخاب‌های امروز تو
            ساخته شده‌اند.
          </p>

          <div className="mt-5 inline-flex items-center rounded-full border border-[#cd8ee4]/30 bg-[#bd70da]/15 px-4 py-2 text-xs font-medium text-[#e5baf1]">
            {recommendation.outfits.length} استایل شخصی‌سازی‌شده برایت آماده شده
          </div>
        </section>

        {/* Outfit Tabs */}
        <section className="mb-7">
          <div
            className={`mx-auto grid max-w-4xl grid-cols-1 gap-3 ${
              recommendation.outfits.length === 1
                ? "sm:grid-cols-1"
                : recommendation.outfits.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3"
            }`}
          >
            {recommendation.outfits.map((outfit, index) => {
              const info = intentLabels[outfit.intent];

              const isActive = index === selectedOutfitIndex;

              return (
                <button
                  key={outfit.rank}
                  type="button"
                  onClick={() => setSelectedOutfitIndex(index)}
                  className={`rounded-2xl border px-5 py-4 text-right transition ${
                    isActive
                      ? "border-[#d28ce7]/70 bg-[#9f59bc]/35 shadow-lg shadow-[#a351bd]/10"
                      : "border-white/12 bg-white/[0.045] hover:border-[#c47edd]/40 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bc70d8]/20 text-lg">
                      {info.icon}
                    </span>

                    <div>
                      <p
                        className={`text-sm font-bold ${
                          isActive ? "text-[#f0cff8]" : "text-white/85"
                        }`}
                      >
                        {info.title}
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        {info.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Outfit */}
        <section className="overflow-hidden rounded-[32px] border border-[#c87ede]/30 bg-[#242126] shadow-2xl shadow-black/20">
          {/* Outfit Header */}
          <div className="border-b border-white/10 bg-gradient-to-l from-[#a75fc4]/30 to-transparent px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{selectedIntent.icon}</span>

                  <h2 className="text-xl font-bold text-[#f2d5fa] sm:text-2xl">
                    {selectedIntent.title}
                  </h2>
                </div>

                <p className="text-sm text-white/50">
                  {selectedIntent.subtitle}
                </p>
              </div>

              <span className="w-fit rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/55">
                پیشنهاد شماره {selectedOutfit.rank}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white/95">
                  ترکیب کامل استایل
                </h3>

                <p className="mt-1 text-xs text-white/45">
                  آیتم‌هایی که برای این اوت‌فیت انتخاب شده‌اند
                </p>
              </div>

              <span className="text-xs text-white/35">
                {selectedOutfit.items.length} آیتم
              </span>
            </div>

            <div className={`grid grid-cols-1 gap-4 ${itemGridClass}`}>
              {selectedOutfit.items.map((item, index) => (
                <article
                  key={`${item.clothingItem.id}-${index}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/12 bg-[#1d1c20] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#c681dc]/45"
                >
                  {item.isOwnedReuse && (
                    <span className="absolute left-3 top-3 rounded-full border border-[#d18ee6]/20 bg-[#9e5ab8]/30 px-2.5 py-1 text-[10px] font-medium text-[#e8bdf3]">
                      ✓ از کمد خودت
                    </span>
                  )}

                  {/* آیکن کمی کوچک‌تر */}
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.07] text-2xl">
                    {slotIcons[item.slot] ?? "✦"}
                  </div>

                  <p className="mb-1 text-xs font-semibold text-[#d49be7]">
                    {slotLabels[item.slot] ?? item.slot}
                  </p>

                  <h4 className="min-h-12 text-base font-bold leading-7 text-white/95">
                    {item.clothingItem.nameFa}
                  </h4>

                  <p className="mt-1 truncate text-xs text-white/35">
                    {item.clothingItem.nameEn}
                  </p>

                  {/* نمایش رنگ واضح‌تر */}
                  <div className="mt-5 flex items-center gap-3 border-t border-white/[0.09] pt-4">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border-2 border-white/25 shadow-sm"
                      style={{
                        backgroundColor:
                          colorSwatches[item.colorFamily] ?? "#777777",
                      }}
                    />

                    <span className="text-xs font-medium text-white/55">
                      {colorLabels[item.colorFamily] ?? item.colorFamily}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Explanation */}
            <div className="mt-8 rounded-3xl border border-[#cf8ce3]/40 bg-[#ad64c8]/15 p-6 shadow-inner shadow-[#a95bc2]/5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ae65ca]/30 text-xl">
                  💜
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#f3d3fa]">
                    چرا Stila این استایل را پیشنهاد داده؟
                  </h3>

                  <p className="mt-1 text-xs text-white/45">
                    دلیل انتخاب این ترکیب براساس اطلاعات و ترجیحات تو
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/10 px-5 py-4">
                <p className="text-[15px] font-medium leading-8 text-white/80">
                  {selectedOutfit.explanation}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="mt-8 flex flex-col-reverse items-stretch justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/questions")}
            className="rounded-2xl bg-[#a45fc2] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[#b56bd0]"
          >
            پیشنهاد جدید می‌خواهم
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-2xl border border-white/12 bg-white/[0.06] px-8 py-3.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            بازگشت به خانه
          </button>
        </section>

        <p className="mt-6 text-center text-[11px] text-white/25">
          پیشنهادها براساس اطلاعات و ترجیحات واردشده توسط شما ساخته شده‌اند.
        </p>
      </div>
    </main>
  );
}
