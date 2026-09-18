import Image from "next/image";
import { Sparkles } from "lucide-react";

import type { QuestionOption, VisualType } from "@/types/questionnaire";

type OptionCardProps = {
  option: QuestionOption;
  visualType: VisualType;
  selected: boolean;
  onSelect: () => void;
};

/*
  ایموجی‌های سوال‌های قبلی
  مثل موقعیت و فصل
*/
function getEmojiIcon(icon?: string) {
  switch (icon) {
    // Question 6 - Occasion
    case "daily":
      return "☀️";

    case "university":
      return "🎒";

    case "work":
      return "💼";

    case "friends":
      return "👥";

    case "party":
      return "🎉";

    case "cafe":
      return "☕";

    case "formal":
      return "👔";

    case "travel":
      return "🧳";

    // Question 7 - Season
    case "spring":
      return "🌸";

    case "summer":
      return "☀️";

    case "autumn":
      return "🍂";

    case "winter":
      return "❄️";

    case "all_seasons":
      return "🗓️";

    default:
      return null;
  }
}

export default function OptionCard({
  option,
  visualType,
  selected,
  onSelect,
}: OptionCardProps) {
  const emojiIcon = getEmojiIcon(option.icon);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex min-h-24 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 text-center transition duration-200 ${
        visualType === "image" ? "p-3" : "px-5 py-4"
      } ${
        selected
          ? "border-[#71368d] bg-gradient-to-br from-[#c986e6] to-[#a85bc8] text-white shadow-lg"
          : "border-[#a967c4] bg-[#d3a0e8] text-[#281b2d] hover:-translate-y-1 hover:border-[#81429c] hover:shadow-md"
      }`}
    >
      {/* علامت انتخاب */}
      {selected && (
        <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#8f46ad] shadow">
          ✓
        </span>
      )}

      {/* عکس گزینه - مخصوص سوال‌های تصویری مثل سوال 8 */}
      {visualType === "image" && option.image && (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white">
          <Image
            src={option.image}
            alt={option.label}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
            className="object-cover"
          />
        </div>
      )}

      {/* ایموجی سوال‌های 6 و 7 */}
      {visualType !== "image" && emojiIcon && (
        <span className="text-4xl" aria-hidden="true">
          {emojiIcon}
        </span>
      )}

      {/* فقط برای گزینه "استایل کاملاً جدید" در سوال 14 */}
      {/*{visualType !== "image" && option.icon === "new_outfit" && (
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
            selected ? "bg-white/15" : "bg-white/35"
          }`}
          aria-hidden="true"
        >
          <Sparkles
            className={`h-9 w-9 ${selected ? "text-white" : "text-[#643278]"}`}
          />
        </span>
      )}*/}

      {/* رنگ پوست */}
      {visualType === "color-circle" && option.colors?.[0] && (
        <span
          className="h-14 w-14 rounded-full border-2 border-white/70 shadow-md"
          style={{
            backgroundColor: option.colors[0],
          }}
          aria-hidden="true"
        />
      )}

      {/* پالت رنگ */}
      {visualType === "color-palette" && option.colors && (
        <div
          className="flex flex-wrap items-center justify-center gap-2"
          aria-hidden="true"
        >
          {option.colors.map((color) => (
            <span
              key={color}
              className="h-9 w-9 rounded-full border-2 border-white/70 shadow-sm"
              style={{
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      )}

      {/* عنوان */}
      <span
        className={`font-bold ${
          visualType === "image" ? "px-2 py-1 text-base sm:text-lg" : "text-lg"
        }`}
      >
        {option.label}
      </span>

      {/* توضیحات */}
      {option.description && (
        <span
          className={`px-2 text-sm leading-6 ${
            selected ? "text-white/85" : "text-[#684175]"
          }`}
        >
          {option.description}
        </span>
      )}
    </button>
  );
}
