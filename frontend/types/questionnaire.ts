export type Gender = "female" | "male" | "both";

export type QuestionType = "single" | "multiple";

export type VisualType =
  | "text"
  | "image" // هر گزینه تصویر جداگانه دارد
  | "question-image" // یک تصویر کلی برای خود سؤال
  | "color-palette"
  | "color-circle"
  | "slider";

export type QuestionnaireStage = 1 | 2 | 3 | 4;

export type QuestionOption = {
  label: string;
  value: string;
  description?: string;

  // برای سؤال‌هایی که هر گزینه تصویر جداگانه دارد
  image?: string;

  // برای سؤال‌های رنگ پوست و پالت رنگی
  colors?: string[];

  icon?: string;
  exclusive?: boolean;
};

export type Question = {
  id: string;
  title: string;

  // مشخص می‌کند سؤال برای زنان، مردان یا هر دو است
  gender: Gender;

  // مرحله پرسشنامه
  stage: QuestionnaireStage;

  // تک‌انتخابی یا چندانتخابی
  type: QuestionType;

  // نحوه نمایش گزینه‌ها
  visualType: VisualType;
  //
  scope: QuestionScope;

  // آیا پاسخ‌دادن به سؤال اجباری است؟
  required: boolean;

  // حداکثر تعداد انتخاب برای سؤالات چندانتخابی
  maxSelections?: number;

  // متن راهنمای سؤال
  helperText?: string;

  // تصویر کلی سؤال
  image?: string;
  imageAlt?: string;
  imageFit?: "cover" | "contain";
  imageAspect?: "wide" | "medium" | "tall" | "natural";
  // گزینه‌های سؤال
  options: QuestionOption[];
};

export type QuestionnaireAnswers = Record<string, string[]>;

export type QuestionScope = "profile" | "request";
