"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { questions } from "@/data/questions";

import QuestionCard from "@/components/questionnaire/QuestionCard";
import QuestionnaireLayout from "@/components/questionnaire/QuestionnaireLayout";

import { useAuth } from "@/context/AuthContext";

import { mapRequestAnswersToBackend } from "@/utils/requestMapper";

import type { QuestionnaireAnswers } from "@/types/questionnaire";

const TOTAL_STAGES = 3;

const stageTitles = {
  1: "نیاز امروز",
  2: "کمد شما",
  3: "تنظیم پیشنهاد",
};

type BackendProfileResponse = {
  gender: string | null;
  styleProfile: unknown | null;
};

export default function QuestionsPage() {
  const router = useRouter();

  const { token, isAuthReady, isLoggedIn, logout } = useAuth();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

  const [selectedGender, setSelectedGender] = useState<
    "female" | "male" | null
  >(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  /*
    جنسیت کاربر از Backend گرفته می‌شود.
  */
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isLoggedIn || !token) {
      router.replace("/login");
      return;
    }

    const authToken = token;

    async function loadProfile() {
      try {
        setIsLoadingProfile(true);
        setLoadError("");

        const response = await fetch("http://localhost:5000/user/profile", {
          method: "GET",

          headers: {
            Authorization: authToken,
          },
        });

        if (response.status === 401) {
          logout();
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          setLoadError(
            "دریافت اطلاعات پروفایل انجام نشد. لطفاً دوباره تلاش کنید.",
          );

          return;
        }

        const data: BackendProfileResponse = await response.json();

        if (!data.styleProfile) {
          router.replace("/profile/setup");
          return;
        }

        if (data.gender === "FEMALE") {
          setSelectedGender("female");
          return;
        }

        if (data.gender === "MALE") {
          setSelectedGender("male");
          return;
        }

        router.replace("/profile/setup");
      } catch (error) {
        console.error("Could not load profile:", error);

        setLoadError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [isAuthReady, isLoggedIn, token, router, logout]);

  /*
    فقط سؤال‌های Request مربوط به جنسیت کاربر.
  */
  const visibleQuestions = useMemo(() => {
    if (!selectedGender) {
      return [];
    }

    return questions.filter((question) => {
      if (question.scope !== "request") {
        return false;
      }

      if (question.gender === "both") {
        return true;
      }

      return question.gender === selectedGender;
    });
  }, [selectedGender]);

  function getRequestStage(questionId: string) {
    if (
      questionId === "occasion" ||
      questionId === "season" ||
      questionId === "female_fit_preference" ||
      questionId === "male_fit_preference" ||
      questionId === "female_coverage_preference" ||
      questionId === "male_formality_level"
    ) {
      return 1;
    }

    if (
      questionId === "female_wardrobe_palette" ||
      questionId === "male_wardrobe_palette" ||
      questionId === "female_wardrobe_items" ||
      questionId === "male_wardrobe_items"
    ) {
      return 2;
    }

    if (
      questionId === "female_exploration_level" ||
      questionId === "male_exploration_level"
    ) {
      return 3;
    }

    return 1;
  }

  if (!isAuthReady || isLoadingProfile) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#1c1e1e] text-white">
        <p className="text-white/70">در حال آماده‌سازی پرسشنامه...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main
        dir="rtl"
        className="flex min-h-svh items-center justify-center bg-[#1c1e1e] px-4 text-white"
      >
        <div className="w-full max-w-lg rounded-[30px] border border-red-400/20 bg-[#29252d] p-8 text-center">
          <h1 className="mb-3 text-xl font-bold text-[#ebc6f5]">
            خطا در دریافت پروفایل
          </h1>

          <p className="text-sm leading-7 text-white/60">{loadError}</p>
        </div>
      </main>
    );
  }

  if (!selectedGender) {
    return null;
  }

  const currentQuestion = visibleQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return null;
  }

  const selectedValues = answers[currentQuestion.id] ?? [];

  const isFirstQuestion = currentQuestionIndex === 0;

  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;

  const currentStage = getRequestStage(currentQuestion.id);

  const stageTitle = stageTitles[currentStage as keyof typeof stageTitles];

  const canGoNext = !currentQuestion.required || selectedValues.length > 0;

  function handleSelectOption(value: string) {
    setAnswers((previousAnswers) => {
      const previousSelectedValues = previousAnswers[currentQuestion.id] ?? [];

      const isMultipleChoice = currentQuestion.type === "multiple";

      if (isMultipleChoice) {
        const selectedOption = currentQuestion.options.find(
          (option) => option.value === value,
        );

        if (selectedOption?.exclusive) {
          return {
            ...previousAnswers,
            [currentQuestion.id]: [value],
          };
        }

        const previousWithoutExclusive = previousSelectedValues.filter(
          (selectedValue) => {
            const option = currentQuestion.options.find(
              (item) => item.value === selectedValue,
            );

            return !option?.exclusive;
          },
        );

        const optionAlreadySelected = previousWithoutExclusive.includes(value);

        if (optionAlreadySelected) {
          return {
            ...previousAnswers,

            [currentQuestion.id]: previousWithoutExclusive.filter(
              (selectedValue) => selectedValue !== value,
            ),
          };
        }

        if (
          currentQuestion.maxSelections &&
          previousWithoutExclusive.length >= currentQuestion.maxSelections
        ) {
          return previousAnswers;
        }

        return {
          ...previousAnswers,

          [currentQuestion.id]: [...previousWithoutExclusive, value],
        };
      }

      return {
        ...previousAnswers,
        [currentQuestion.id]: [value],
      };
    });
  }

  function handlePrevious() {
    if (isFirstQuestion) {
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
  }

  async function handleNext() {
    if (!canGoNext || isSubmitting) {
      return;
    }

    /*
      هنوز به آخر پرسشنامه نرسیده‌ایم.
    */
    if (!isLastQuestion) {
      setCurrentQuestionIndex((previousIndex) => previousIndex + 1);

      return;
    }

    /*
      کاربر روی "مشاهده پیشنهاد" زده است.
    */
    if (!selectedGender || !token) {
      return;
    }

    const authToken = token;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      /*
        answers فرانت
              ↓
        Payload مورد قبول Backend
      */
      const requestPayload = mapRequestAnswersToBackend(
        answers,
        selectedGender,
      );

      /*
        Payload برای /recommend ارسال می‌شود.
      */
      const response = await fetch("http://localhost:5000/recommend", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },

        body: JSON.stringify(requestPayload),
      });

      if (response.status === 401) {
        logout();
        router.replace("/login");
        return;
      }

      if (response.status === 400) {
        setSubmitError("اطلاعات درخواست یا پروفایل کامل نیست.");

        return;
      }

      if (response.status === 422) {
        setSubmitError("برای این انتخاب‌ها اوت‌فیت مناسبی پیدا نشد.");

        return;
      }

      if (!response.ok) {
        setSubmitError("دریافت پیشنهاد با خطا مواجه شد.");

        return;
      }

      /*
        Response واقعی Rule Engine
      */
      const recommendation = await response.json();

      /*
        Response را موقت ذخیره می‌کنیم
        تا صفحه Recommendation بتواند آن را بخواند.
      */
      sessionStorage.setItem(
        "latestRecommendation",
        JSON.stringify(recommendation),
      );

      /*
        حالا کاربر را به صفحه نتیجه می‌فرستیم.
      */
      router.push("/recommendation");
    } catch (error) {
      console.error("Recommendation request error:", error);

      setSubmitError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <QuestionnaireLayout
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={visibleQuestions.length}
        currentStage={currentStage}
        totalStages={TOTAL_STAGES}
        stageTitle={stageTitle}
        isFirstQuestion={isFirstQuestion}
        isLastQuestion={isLastQuestion}
        canGoNext={canGoNext && !isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
        finalButtonText={
          isSubmitting ? "در حال ساخت پیشنهاد..." : "مشاهده پیشنهاد"
        }
        showStageInfo={true}
      >
        <QuestionCard
          question={currentQuestion}
          selectedValues={selectedValues}
          onSelectOption={handleSelectOption}
        />
      </QuestionnaireLayout>

      {submitError && (
        <div
          dir="rtl"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-500/90 px-5 py-3 text-sm text-white shadow-lg"
        >
          {submitError}
        </div>
      )}
    </>
  );
}
