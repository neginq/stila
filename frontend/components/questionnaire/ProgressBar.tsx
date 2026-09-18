type ProgressBarProps = {
  currentQuestion: number;
  totalQuestions: number;
  currentStage: number;
  totalStages: number;
  stageTitle: string;

  // اگر false باشد، اطلاعات مرحله نمایش داده نمی‌شود
  showStageInfo?: boolean;
};

export default function ProgressBar({
  currentQuestion,
  totalQuestions,
  currentStage,
  totalStages,
  stageTitle,
  showStageInfo = true,
}: ProgressBarProps) {
  const progressPercentage =
    totalQuestions === 0
      ? 0
      : Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <section className="w-full">
      <div
        className={`mb-3 flex gap-2 text-sm text-[#d9a7eb] ${
          showStageInfo
            ? "flex-col sm:flex-row sm:items-center sm:justify-between"
            : "justify-end"
        }`}
      >
        {showStageInfo && (
          <p className="font-bold">
            مرحله {currentStage} از {totalStages} — {stageTitle}
          </p>
        )}

        <p>
          سؤال {currentQuestion} از {totalQuestions}
        </p>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-white/15"
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="میزان پیشرفت پرسشنامه"
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-[#8a47aa] via-[#ad65cc] to-[#d092e8] transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>
    </section>
  );
}
