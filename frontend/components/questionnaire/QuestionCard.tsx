import Image from "next/image";
import OptionCard from "./OptionCard";
import type { Question } from "@/types/questionnaire";

type QuestionCardProps = {
  question: Question;
  selectedValues: string[];
  onSelectOption: (value: string) => void;
};

export default function QuestionCard({
  question,
  selectedValues,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <section className="w-full rounded-[36px] bg-gradient-to-br from-[#d6a0ed] via-[#ca8de5] to-[#bd7cda] px-5 py-6 text-[#25172b] shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold leading-10 sm:text-3xl">
          {question.title}
        </h2>

        {question.helperText && (
          <p className="mt-3 text-sm leading-7 text-[#684175] sm:text-base">
            {question.helperText}
          </p>
        )}
      </div>

      {question.image && (
        <div className="mx-auto mb-7 w-full max-w-4xl rounded-3xl bg-white/30 p-3 shadow-md">
          {question.imageAspect === "natural" ? (
            <div className="flex w-full justify-center">
              <Image
                src={question.image}
                alt={question.imageAlt ?? question.title}
                width={1200}
                height={700}
                sizes="(max-width: 768px) 90vw, 900px"
                className="h-auto w-full max-w-3xl rounded-3xl object-contain"
              />
            </div>
          ) : question.imageAspect === "medium" ? (
            <div className="flex min-h-[320px] w-full items-center justify-center overflow-hidden rounded-3xl sm:min-h-[380px]">
              <Image
                src={question.image}
                alt={question.imageAlt ?? question.title}
                width={1000}
                height={700}
                sizes="(max-width: 768px) 90vw, 900px"
                className="max-h-[380px] w-auto max-w-full rounded-3xl object-contain"
              />
            </div>
          ) : question.imageAspect === "tall" ? (
            <div className="relative h-[400px] w-full overflow-hidden rounded-3xl sm:h-[480px]">
              <Image
                src={question.image}
                alt={question.imageAlt ?? question.title}
                fill
                sizes="(max-width: 768px) 90vw, 900px"
                className={
                  question.imageFit === "contain"
                    ? "rounded-3xl object-contain"
                    : "rounded-3xl object-cover"
                }
              />
            </div>
          ) : (
            <div className="relative aspect-[4/1] w-full overflow-hidden rounded-3xl">
              <Image
                src={question.image}
                alt={question.imageAlt ?? question.title}
                fill
                sizes="(max-width: 768px) 90vw, 900px"
                className={
                  question.imageFit === "contain"
                    ? "rounded-3xl object-contain"
                    : "rounded-3xl object-cover"
                }
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {question.options.map((option) => (
          <div
            key={option.value}
            className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
          >
            <OptionCard
              option={option}
              visualType={question.visualType}
              selected={selectedValues.includes(option.value)}
              onSelect={() => onSelectOption(option.value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
