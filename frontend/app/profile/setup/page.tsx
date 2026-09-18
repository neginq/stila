"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { questions } from "@/data/questions";

import QuestionCard from "@/components/questionnaire/QuestionCard";
import QuestionnaireLayout from "@/components/questionnaire/QuestionnaireLayout";

import { useAuth } from "@/context/AuthContext";

import { mapProfileAnswersToBackend } from "@/utils/profileMapper";

import {
  mapBackendProfileToAnswers,
  type BackendUserProfile,
} from "@/utils/profileResponseMapper";

import type { QuestionnaireAnswers } from "@/types/questionnaire";

export default function ProfileSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next");
  const { token, isAuthReady, isLoggedIn, logout } = useAuth();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

  const [isSaving, setIsSaving] = useState(false);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);

  const [saveError, setSaveError] = useState("");

  const [loadError, setLoadError] = useState("");

  /*
    وقتی صفحه باز می‌شود،
    اطلاعات فعلی کاربر را از Backend می‌گیریم.

    اگر styleProfile وجود داشته باشد:
    یعنی کاربر در حال Edit است.

    اگر styleProfile برابر null باشد:
    یعنی اولین بار است که Profile را تکمیل می‌کند.
  */
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isLoggedIn || !token) {
      router.push("/login");
      return;
    }

    const authToken = token;

    async function loadExistingProfile() {
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

        /*
          Profile قبلاً وجود دارد:
          جواب‌های Backend را به فرمت سؤال‌های Frontend
          تبدیل و داخل answers قرار می‌دهیم.
        */
        if (data.styleProfile) {
          const mappedAnswers = mapBackendProfileToAnswers(data);

          setAnswers(mappedAnswers);

          setIsEditMode(true);
        } else {
          /*
            کاربر جدید است و هنوز Profile Style ندارد.
          */
          setAnswers({});

          setIsEditMode(false);
        }
      } catch (error) {
        console.error("Could not load existing profile:", error);

        setLoadError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadExistingProfile();
  }, [isAuthReady, isLoggedIn, token, router, logout]);

  const selectedGender = answers.gender?.[0];

  const profileQuestions = questions.filter((question) => {
    if (question.scope !== "profile") {
      return false;
    }

    if (question.gender === "both") {
      return true;
    }

    if (!selectedGender) {
      return false;
    }

    return question.gender === selectedGender;
  });

  const currentQuestion = profileQuestions[currentQuestionIndex];

  const selectedValues = currentQuestion
    ? (answers[currentQuestion.id] ?? [])
    : [];

  const isFirstQuestion = currentQuestionIndex === 0;

  const isLastQuestion = currentQuestionIndex === profileQuestions.length - 1;

  const canGoNext = currentQuestion
    ? !currentQuestion.required || selectedValues.length > 0
    : false;

  function handleSelectOption(value: string) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((previousAnswers) => {
      const previousSelectedValues = previousAnswers[currentQuestion.id] ?? [];

      const isMultipleChoice = currentQuestion.type === "multiple";

      // -------------------------
      // سؤال چندانتخابی
      // -------------------------
      if (isMultipleChoice) {
        const selectedOption = currentQuestion.options.find(
          (option) => option.value === value,
        );

        /*
          مثل "هیچ‌کدام"
        */
        if (selectedOption?.exclusive) {
          return {
            ...previousAnswers,
            [currentQuestion.id]: [value],
          };
        }

        /*
          اگر قبلاً گزینه exclusive انتخاب شده بود،
          آن را حذف می‌کنیم.
        */
        const previousWithoutExclusive = previousSelectedValues.filter(
          (selectedValue) => {
            const option = currentQuestion.options.find(
              (item) => item.value === selectedValue,
            );

            return !option?.exclusive;
          },
        );

        const optionAlreadySelected = previousWithoutExclusive.includes(value);

        /*
          کلیک دوباره روی گزینه،
          آن را از انتخاب‌ها حذف می‌کند.
        */
        if (optionAlreadySelected) {
          return {
            ...previousAnswers,

            [currentQuestion.id]: previousWithoutExclusive.filter(
              (selectedValue) => selectedValue !== value,
            ),
          };
        }

        /*
          حداکثر تعداد انتخاب‌ها رعایت شود.
        */
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

      // -------------------------
      // سؤال تک‌انتخابی
      // -------------------------
      const updatedAnswers = {
        ...previousAnswers,

        [currentQuestion.id]: [value],
      };

      /*
        اگر gender عوض شود،
        جواب‌های مخصوص gender قبلی باید حذف شوند.
      */
      if (currentQuestion.id === "gender") {
        const newGender = value;

        questions.forEach((question) => {
          if (question.gender !== "both" && question.gender !== newGender) {
            delete updatedAnswers[question.id];
          }
        });
      }

      return updatedAnswers;
    });
  }

  function handlePrevious() {
    if (isFirstQuestion || isSaving) {
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
  }

  async function saveProfile() {
    if (!isAuthReady) {
      return;
    }

    if (!isLoggedIn || !token) {
      router.push("/login");
      return;
    }

    const authToken = token;

    try {
      setIsSaving(true);
      setSaveError("");

      /*
        جواب‌های Frontend را به enumهای Backend
        تبدیل می‌کنیم.
      */
      const profileBody = mapProfileAnswersToBackend(answers);

      const response = await fetch("http://localhost:5000/user/profile", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },

        body: JSON.stringify(profileBody),
      });

      if (response.status === 401) {
        logout();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setSaveError("ذخیره پروفایل انجام نشد. لطفاً دوباره تلاش کنید.");

        return;
      }

      /*
        اگر کاربر در حال ویرایش Profile قبلی بود،
        بعد از ذخیره به /profile برمی‌گردد.

        اگر اولین بار Profile را ساخته،
        طبق flow اصلی به /questions می‌رود.
      */
      if (isEditMode) {
        router.push("/profile");
      } else if (next === "questions") {
        router.push("/questions");
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Could not save profile:", error);

      setSaveError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleNext() {
    if (!canGoNext || isSaving) {
      return;
    }

    if (isLastQuestion) {
      await saveProfile();
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
  }

  /*
    صبر می‌کنیم ابتدا Backend مشخص کند
    Profile قبلی وجود دارد یا نه.
  */
  if (!isAuthReady || isLoadingProfile) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#191b1d] text-white">
        <p className="text-white/70">در حال بارگذاری پروفایل...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#191b1d] px-4 text-white">
        <div className="w-full max-w-lg rounded-[32px] border border-red-400/20 bg-[#2a232e] p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-[#ebc6f5]">
            خطا در دریافت پروفایل
          </h1>

          <p className="mb-7 text-white/55">{loadError}</p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full bg-gradient-to-l from-[#71368d] via-[#914ab0] to-[#b05fc9] px-7 py-3 font-bold text-white"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <QuestionnaireLayout
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={profileQuestions.length}
      currentStage={1}
      totalStages={1}
      stageTitle={isEditMode ? "ویرایش پروفایل استایل" : "تکمیل پروفایل استایل"}
      isFirstQuestion={isFirstQuestion}
      isLastQuestion={isLastQuestion}
      canGoNext={canGoNext && !isSaving}
      onPrevious={handlePrevious}
      onNext={handleNext}
      finalButtonText={
        isSaving
          ? "در حال ذخیره..."
          : isEditMode
            ? "ذخیره تغییرات"
            : "تکمیل پروفایل"
      }
      showStageInfo={false}
    >
      {saveError && (
        <p className="mb-4 rounded-xl bg-red-100/70 px-4 py-3 text-center text-sm font-medium text-red-800">
          {saveError}
        </p>
      )}

      <QuestionCard
        question={currentQuestion}
        selectedValues={selectedValues}
        onSelectOption={handleSelectOption}
      />
    </QuestionnaireLayout>
  );
}
