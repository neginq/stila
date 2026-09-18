import Link from "next/link";
import type { ReactNode } from "react";

import ProgressBar from "./ProgressBar";
import NavigationButtons from "./NavigationButtons";

type QuestionnaireLayoutProps = {
  children: ReactNode;

  currentQuestion: number;
  totalQuestions: number;

  currentStage: number;
  totalStages: number;
  stageTitle: string;

  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canGoNext: boolean;

  onPrevious: () => void;
  onNext: () => void;

  // متن دکمه آخر
  finalButtonText?: string;

  // نمایش یا عدم نمایش اطلاعات مرحله
  showStageInfo?: boolean;
};

export default function QuestionnaireLayout({
  children,
  currentQuestion,
  totalQuestions,
  currentStage,
  totalStages,
  stageTitle,
  isFirstQuestion,
  isLastQuestion,
  canGoNext,
  onPrevious,
  onNext,
  finalButtonText,
  showStageInfo = true,
}: QuestionnaireLayoutProps) {
  return (
    <main className="min-h-svh bg-[#1c1e1e] px-4 py-5 text-white sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-4xl italic text-[#c886e5] transition hover:text-[#dba6ef] sm:text-5xl"
          >
            Stila
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-[#c886e5] hover:text-[#dba6ef]"
          >
            خروج از پرسشنامه
          </Link>
        </header>

        {/* Progress */}
        <ProgressBar
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          currentStage={currentStage}
          totalStages={totalStages}
          stageTitle={stageTitle}
          showStageInfo={showStageInfo}
        />

        {/* Question content */}
        <div className="mt-6">{children}</div>

        {/* Navigation */}
        <NavigationButtons
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
          canGoNext={canGoNext}
          onPrevious={onPrevious}
          onNext={onNext}
          finalButtonText={finalButtonText}
        />
      </section>
    </main>
  );
}
