type NavigationButtonsProps = {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canGoNext: boolean;

  onPrevious: () => void;
  onNext: () => void;

  // متن دکمه آخر
  finalButtonText?: string;
};

export default function NavigationButtons({
  isFirstQuestion,
  isLastQuestion,
  canGoNext,
  onPrevious,
  onNext,
  finalButtonText = "مشاهده پیشنهاد",
}: NavigationButtonsProps) {
  return (
    <div className="mt-6 flex w-full items-center justify-between gap-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="inline-flex min-w-32 items-center justify-center rounded-full border-2 border-[#a65fc5] px-6 py-3 font-bold text-[#d9a7eb] transition hover:bg-[#a65fc5]/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        قبلی
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="inline-flex min-w-32 items-center justify-center rounded-full bg-gradient-to-l from-[#7f3f9e] via-[#984db7] to-[#ad67ca] px-6 py-3 font-bold text-white shadow-md transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {isLastQuestion ? finalButtonText : "بعدی"}
      </button>
    </div>
  );
}
