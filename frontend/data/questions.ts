import type { Question } from "@/types/questionnaire";

export const questions: Question[] = [
  {
    id: "gender",
    title: "جنسیت شما چیست؟",
    gender: "both",
    stage: 1,
    type: "single",
    visualType: "question-image",
    scope: "profile",
    required: true,
    image: "/images/questions/gender/q1-gender.jpg",
    imageAlt: " انتخاب جنسیت",
    imageFit: "cover",
    imageAspect: "wide",
    options: [
      {
        label: "زن",
        value: "female",
      },
      {
        label: "مرد",
        value: "male",
      },
    ],
  },

  {
    id: "age_group",
    title: "در چه بازه سنی قرار دارید؟",
    gender: "both",
    stage: 1,
    type: "single",
    visualType: "text",
    scope: "profile",
    required: true,

    options: [
      {
        label: "کمتر از ۱۸ سال",
        value: "under_18",
      },
      {
        label: "۱۸ تا ۲۴ سال",
        value: "18_24",
      },
      {
        label: "۲۵ تا ۳۴ سال",
        value: "25_34",
      },
      {
        label: "۳۵ تا ۴۴ سال",
        value: "35_44",
      },
      {
        label: "۴۵ سال و بیشتر",
        value: "45_plus",
      },
    ],
  },

  {
    id: "skin_tone",
    title: "رنگ پوست شما به کدام گزینه نزدیک‌تر است؟",
    gender: "both",
    stage: 1,
    type: "single",
    visualType: "color-circle",
    scope: "profile",
    required: true,
    helperText: "نزدیک‌ترین گزینه را انتخاب کنید.",
    options: [
      {
        label: "بسیار روشن",
        value: "very_fair",
        colors: ["#F8DDD0"],
      },
      {
        label: "روشن",
        value: "fair",
        colors: ["#EFC5AE"],
      },
      {
        label: "روشن تا متوسط",
        value: "light_medium",
        colors: ["#DDAA87"],
      },
      {
        label: "گندمی",
        value: "medium",
        colors: ["#BF845E"],
      },
      {
        label: "سبزه",
        value: "olive",
        colors: ["#986344"],
      },
      {
        label: "تیره",
        value: "deep",
        colors: ["#613B2D"],
      },
      {
        label: "مطمئن نیستم",
        value: "unsure",
        colors: ["#D4CDD7"],
      },
    ],
  },

  {
    id: "skin_undertone",
    title: "تناژ یا زیرتن پوست شما چیست؟",
    gender: "both",
    stage: 1,
    type: "single",
    visualType: "color-palette",
    scope: "profile",
    required: true,
    helperText: "گزینه‌ای را انتخاب کنید که به تناژ پوست شما نزدیک‌تر است.",
    options: [
      {
        label: "گرم",
        value: "warm",
        description: "رگ‌های سبز",
        //colors: ["#E5C58F", "#7E8451", "#B66043", "#CDA434"],
      },
      {
        label: "سرد",
        value: "cool",
        description: "رگ‌های آبی یا بنفش",
        //colors: ["#799BC8", "#8C72B3", "#D19AB7", "#BFC3C8"],
      },
      {
        label: "خنثی",
        value: "neutral",
        description: "ترکیبی از رنگ‌های گرم و سرد",
        //colors: ["#BBAA91", "#8D91A8", "#A9827C", "#A3A587"],
      },
      {
        label: "مطمئن نیستم",
        value: "unsure",
        //description: "در ادامه از پالت‌های عمومی‌تر استفاده می‌کنیم.",
        //colors: ["#D8D2DA", "#B7ADB9", "#918795"],
      },
    ],
  },

  {
    id: "female_body_shape",
    title: "فرم بدن شما به کدام گزینه نزدیک‌تر است؟",
    gender: "female",
    stage: 1,
    type: "single",
    visualType: "question-image",
    scope: "profile",
    required: true,
    image: "/images/questions/body-shape/female/q5-female-bodyshape.png",
    imageAlt: "انواع فرم بدن زنان",
    imageFit: "contain",
    imageAspect: "medium",
    helperText:
      "اگر مطمئن نیستید، گزینه‌ای را انتخاب کنید که بیشترین شباهت را دارد.",
    options: [
      {
        label: "ساعت شنی",
        value: "hourglass",
        description: "عرض شانه و باسن نزدیک و کمر مشخص",
      },
      {
        label: "گلابی",
        value: "pear",
        description: "پایین‌تنه پهن‌تر از شانه‌ها",
      },
      {
        label: "سیبی",
        value: "apple",
        description: "بخش میانی بدن برجسته‌تر است",
      },
      {
        label: "مستطیلی",
        value: "rectangle",
        description: "شانه، کمر و باسن تقریباً هم‌عرض هستند",
      },
      {
        label: "مثلث وارونه",
        value: "inverted_triangle",
        description: "شانه‌ها پهن‌تر از پایین‌تنه هستند",
      },
      {
        label: "مطمئن نیستم",
        value: "unsure",
      },
    ],
  },

  {
    id: "male_body_shape",
    title: "فرم بدن شما به کدام گزینه نزدیک‌تر است؟",
    gender: "male",
    stage: 1,
    type: "single",
    visualType: "question-image",
    scope: "profile",
    required: true,
    image: "/images/questions/body-shape/male/q5-male-bodyshape.png",
    imageAlt: "انواع فرم بدن مردان",
    imageFit: "contain",
    imageAspect: "medium",
    helperText:
      "اگر مطمئن نیستید، گزینه‌ای را انتخاب کنید که بیشترین شباهت را دارد.",
    options: [
      {
        label: "ذوزنقه‌ای",
        value: "trapezoid",
        description: "شانه‌ها کمی پهن‌تر از کمر و فرم کلی متعادل",
      },
      {
        label: "مستطیلی",
        value: "rectangle",
        description: "شانه و کمر تقریباً هم‌عرض هستند",
      },
      {
        label: "مثلثی",
        value: "triangle",
        description: "بخش میانی یا پایین‌تنه پهن‌تر از شانه‌ها",
      },
      {
        label: "بیضی",
        value: "oval",
        description: "قسمت میانی بدن برجسته‌تر و گردتر است",
      },
      {
        label: "مثلث وارونه",
        value: "inverted_triangle",
        description: "شانه و سینه پهن‌تر از کمر هستند",
      },
      {
        label: "مطمئن نیستم",
        value: "unsure",
      },
    ],
  },
  {
    id: "occasion",
    title: "برای چه موقعیتی به دنبال استایل هستید؟",
    gender: "both",
    stage: 2,
    type: "single",
    visualType: "text",
    scope: "request",
    required: true,

    options: [
      {
        label: "استفاده روزمره",
        value: "daily",
        icon: "daily",
      },
      {
        label: "دانشگاه",
        value: "university",
        icon: "university",
      },
      {
        label: "محل کار",
        value: "work",
        icon: "work",
      },
      {
        label: "دورهمی دوستانه",
        value: "friends",
        icon: "friends",
      },
      {
        label: "مهمانی",
        value: "party",
        icon: "party",
      },
      {
        label: "قرار یا کافه",
        value: "date_cafe",
        icon: "cafe",
      },
      {
        label: "مراسم رسمی",
        value: "formal_event",
        icon: "formal",
      },
      {
        label: "سفر و گردش",
        value: "travel",
        icon: "travel",
      },
    ],
  },
  {
    id: "season",
    title: "این استایل را برای کدام فصل می‌خواهید؟",
    gender: "both",
    stage: 2,
    type: "single",
    visualType: "text",
    scope: "request",
    required: true,

    options: [
      {
        label: "بهار",
        value: "spring",
        icon: "spring",
      },
      {
        label: "تابستان",
        value: "summer",
        icon: "summer",
      },
      {
        label: "پاییز",
        value: "autumn",
        icon: "autumn",
      },
      {
        label: "زمستان",
        value: "winter",
        icon: "winter",
      },
      {
        label: "چهارفصل",
        value: "all_seasons",
        icon: "all_seasons",
      },
    ],
  },
  {
    id: "female_style_preferences",
    title: "بیشتر به کدام سبک‌های پوشش علاقه دارید؟",
    gender: "female",
    stage: 2,
    type: "multiple",
    visualType: "image",
    scope: "profile",
    required: true,
    maxSelections: 2,
    helperText: "حداکثر دو سبک را انتخاب کنید.",

    options: [
      {
        label: "کژوال و روزمره",
        value: "casual",
        image: "/images/questions/styles/female/female-casual.png",
      },
      {
        label: "مینیمال",
        value: "minimal",
        image: "/images/questions/styles/female/female-minimal.png",
      },
      {
        label: "کلاسیک",
        value: "classic",
        image: "/images/questions/styles/female/female-classic.png",
      },
      {
        label: "رسمی",
        value: "formal",
        image: "/images/questions/styles/female/female-formal.png",
      },
      {
        label: "اسپرت",
        value: "sporty",
        image: "/images/questions/styles/female/female-sporty.png",
      },
      {
        label: "خیابانی",
        value: "streetwear",
        image: "/images/questions/styles/female/female-streetwear.png",
      },
      {
        label: "هنری و خلاقانه",
        value: "creative",
        image: "/images/questions/styles/female/female-creative.png",
      },
      {
        label: "رمانتیک و ظریف",
        value: "romantic",
        image: "/images/questions/styles/female/female-romantic.png",
      },
    ],
  },
  {
    id: "male_style_preferences",
    title: "بیشتر به کدام سبک‌های پوشش علاقه دارید؟",
    gender: "male",
    stage: 2,
    type: "multiple",
    visualType: "image",
    scope: "profile",
    required: true,
    maxSelections: 2,
    helperText: "حداکثر دو سبک را انتخاب کنید.",

    options: [
      {
        label: "کژوال و روزمره",
        value: "casual",
        image: "/images/questions/styles/male/male-casual.png",
      },
      {
        label: "مینیمال",
        value: "minimal",
        image: "/images/questions/styles/male/male-minimal.png",
      },
      {
        label: "کلاسیک",
        value: "classic",
        image: "/images/questions/styles/male/male-classic.png",
      },
      {
        label: "رسمی",
        value: "formal",
        image: "/images/questions/styles/male/male-formal.png",
      },
      {
        label: "اسپرت",
        value: "sporty",
        image: "/images/questions/styles/male/male-sporty.png",
      },
      {
        label: "خیابانی",
        value: "streetwear",
        image: "/images/questions/styles/male/male-streetwear.png",
      },
      {
        label: "اسمارت کژوال",
        value: "smart_casual",
        image: "/images/questions/styles/male/male-smart-casual.png",
      },
      {
        label: "هنری و متفاوت",
        value: "creative",
        image: "/images/questions/styles/male/male-creative.png",
      },
    ],
  },
  {
    id: "female_fit_preference",
    title: "ترجیح می‌دهید لباس‌ها روی بدن چگونه قرار بگیرند؟",
    gender: "female",
    stage: 2,
    type: "single",
    visualType: "question-image",
    scope: "request",
    required: true,

    image: "/images/questions/fit/female/q9-female-fit.png",
    imageAlt: "راهنمای انواع فیت لباس برای زنان",

    imageFit: "contain",
    imageAspect: "natural",

    options: [
      {
        label: "آزاد و راحت",
        value: "loose",
      },
      {
        label: "نیمه‌آزاد",
        value: "semi_loose",
      },
      {
        label: "متعادل و معمولی",
        value: "regular",
      },
      {
        label: "نسبتاً جذب",
        value: "fitted",
      },
      {
        label: "بالاتنه آزاد و پایین‌تنه جذب",
        value: "loose_top_fitted_bottom",
      },
      {
        label: "بالاتنه جذب و پایین‌تنه آزاد",
        value: "fitted_top_loose_bottom",
      },
    ],
  },
  {
    id: "male_fit_preference",
    title: "ترجیح می‌دهید لباس‌ها روی بدن چگونه قرار بگیرند؟",
    gender: "male",
    stage: 2,
    type: "single",
    visualType: "question-image",
    scope: "request",
    required: true,

    image: "/images/questions/fit/male/q9-male-fit.png",
    imageAlt: "راهنمای انواع فیت لباس برای مردان",

    imageFit: "contain",
    imageAspect: "natural",

    options: [
      {
        label: "آزاد و راحت",
        value: "loose",
      },
      {
        label: "نیمه‌آزاد",
        value: "semi_loose",
      },
      {
        label: "معمولی و متعادل",
        value: "regular",
      },
      {
        label: "نسبتاً جذب",
        value: "fitted",
      },
      {
        label: "بالاتنه آزاد و شلوار متعادل",
        value: "loose_top_regular_pants",
      },
      {
        label: "بالاتنه متعادل و شلوار آزاد",
        value: "regular_top_loose_pants",
      },
    ],
  },
  {
    id: "female_coverage_preference",
    title: "میزان پوشیدگی موردنظر شما کدام است؟",
    gender: "female",
    stage: 2,
    type: "single",
    visualType: "text",
    scope: "request",
    required: true,

    options: [
      {
        label: "کاملاً پوشیده",
        value: "fully_covered",
      },
      {
        label: "پوشیده و راحت",
        value: "covered_comfortable",
      },
      {
        label: "متعادل",
        value: "balanced",
      },
      {
        label: "محدودیت خاصی ندارم",
        value: "no_specific_limit",
      },
    ],
  },
  {
    id: "male_formality_level",
    title: "در پوشش خود چه میزان رسمی‌بودن را ترجیح می‌دهید؟",
    gender: "male",
    stage: 2,
    type: "single",
    visualType: "text",
    scope: "request",
    required: true,

    options: [
      {
        label: "کاملاً راحت و غیررسمی",
        value: "very_casual",
      },
      {
        label: "بیشتر کژوال",
        value: "casual",
      },
      {
        label: "متعادل",
        value: "balanced",
      },
      {
        label: "اسمارت کژوال",
        value: "smart_casual",
      },
      {
        label: "رسمی و مرتب",
        value: "formal",
      },
    ],
  },
  {
    id: "female_favorite_color_palettes",
    title: "بیشتر به کدام خانواده‌های رنگی علاقه دارید؟",
    gender: "female",
    stage: 3,
    type: "multiple",
    visualType: "color-palette",
    scope: "profile",
    required: true,
    maxSelections: 3,
    helperText: "حداکثر سه خانواده رنگی را انتخاب کنید.",

    options: [
      {
        label: "رنگ‌های خنثی",
        value: "neutral",
        colors: ["#F5F5F5", "#111111", "#7A7A7A", "#CFCFCF"],
      },
      {
        label: "رنگ‌های کرمی و قهوه‌ای",
        value: "cream_brown",
        colors: ["#F2E3C6", "#D2B48C", "#9A6B4F", "#5A3A2E"],
      },
      {
        label: "رنگ‌های گرم",
        value: "warm",
        colors: ["#C94C4C", "#E8873A", "#B95F3B", "#D6A15C"],
      },
      {
        label: "رنگ‌های سرد",
        value: "cool",
        colors: ["#5A86C8", "#8067A9", "#5F9E93", "#8CA9C9"],
      },
      {
        label: "رنگ‌های پاستلی",
        value: "pastel",
        colors: ["#F3C6D3", "#C9DDF2", "#D9C8EA", "#CFE6D5"],
      },
      {
        label: "رنگ‌های تیره",
        value: "dark",
        colors: ["#1E2430", "#3A2536", "#233B35", "#4A302B"],
      },
      {
        label: "رنگ‌های روشن و شاد",
        value: "bright",
        colors: ["#F4C542", "#EE6A5B", "#5DB7DE", "#76C66A"],
      },
    ],
  },
  {
    id: "male_favorite_color_palettes",
    title: "بیشتر به کدام خانواده‌های رنگی علاقه دارید؟",
    gender: "male",
    stage: 3,
    type: "multiple",
    visualType: "color-palette",
    scope: "profile",
    required: true,
    maxSelections: 3,
    helperText: "حداکثر سه خانواده رنگی را انتخاب کنید.",

    options: [
      {
        label: "رنگ‌های خنثی",
        value: "neutral",
        colors: ["#111111", "#F5F5F5", "#747474", "#BFC1C3"],
      },
      {
        label: "رنگ‌های کرمی و قهوه‌ای",
        value: "cream_brown",
        colors: ["#E8D9BC", "#C2A178", "#8B6548", "#4C3428"],
      },
      {
        label: "آبی و سرمه‌ای",
        value: "blue_navy",
        colors: ["#A9C7E8", "#4B77A8", "#244A73", "#172A46"],
      },
      {
        label: "سبز و زیتونی",
        value: "green_olive",
        colors: ["#829B72", "#6F7C45", "#495839", "#B1B78B"],
      },
      {
        label: "رنگ‌های گرم و خاکی",
        value: "warm_earthy",
        colors: ["#B96F45", "#A77A52", "#C39A64", "#7C543A"],
      },
      {
        label: "رنگ‌های پاستلی",
        value: "pastel",
        colors: ["#C9D9E8", "#D7C9DF", "#D8E3C5", "#E8D3C3"],
      },
      {
        label: "رنگ‌های تیره",
        value: "dark",
        colors: ["#1F2732", "#26362E", "#3C2B33", "#332E2A"],
      },
      {
        label: "رنگ‌های روشن و شاد",
        value: "bright",
        colors: ["#E6C43B", "#D96658", "#519AC2", "#66A85B"],
      },
    ],
  },
  {
    id: "colors_disliked",
    title: "کدام رنگ‌ها را معمولاً نمی‌پوشید یا دوست ندارید؟",
    gender: "both",
    stage: 3,
    type: "multiple",
    visualType: "color-palette",
    scope: "profile",
    required: true,
    maxSelections: 3,
    helperText: "حداکثر سه گزینه را انتخاب کنید.",

    options: [
      {
        label: "مشکی",
        value: "black",
        colors: ["#111111"],
      },
      {
        label: "سفید و کرم",
        value: "white_cream",
        colors: ["#F7F7F4", "#EADCC5"],
      },
      {
        label: "قهوه‌ای",
        value: "brown",
        colors: ["#7A5138"],
      },
      {
        label: "قرمز و نارنجی",
        value: "red_orange",
        colors: ["#C94747", "#E7823D"],
      },
      {
        label: "صورتی",
        value: "pink",
        colors: ["#E89AB7"],
      },
      {
        label: "زرد",
        value: "yellow",
        colors: ["#E8C84C"],
      },
      {
        label: "سبز",
        value: "green",
        colors: ["#669265"],
      },
      {
        label: "آبی",
        value: "blue",
        colors: ["#5585B5"],
      },
      {
        label: "بنفش",
        value: "purple",
        colors: ["#8065A5"],
      },
      {
        label: "محدودیتی ندارم",
        value: "none",
        exclusive: true,
      },
    ],
  },
  {
    id: "female_wardrobe_palette",
    title: "بیشتر لباس‌های کمد شما در کدام پالت رنگی هستند؟",
    gender: "female",
    stage: 4,
    type: "single",
    visualType: "color-palette",
    scope: "request",
    required: true,

    options: [
      {
        label: "مشکی، سفید و خاکستری",
        value: "black_white_gray",
        colors: ["#111111", "#F5F5F5", "#7A7A7A", "#C8C8C8"],
      },
      {
        label: "کرم، بژ و قهوه‌ای",
        value: "cream_beige_brown",
        colors: ["#F2E4C8", "#D8C3A5", "#A97955", "#6A4633"],
      },
      {
        label: "آبی و سرمه‌ای",
        value: "blue_navy",
        colors: ["#AFC8E8", "#6D94C4", "#355E8D", "#1E3150"],
      },
      {
        label: "رنگ‌های پاستلی",
        value: "pastel",
        colors: ["#F3C7D6", "#C9DDF2", "#D8C9EB", "#D3E6D2"],
      },
      {
        label: "رنگ‌های گرم و خاکی",
        value: "warm_earthy",
        colors: ["#C27A4A", "#A96F4C", "#B79363", "#7C6442"],
      },
      {
        label: "رنگ‌های شاد و متنوع",
        value: "bright_varied",
        colors: ["#E95E5E", "#F2C84B", "#5BA7D7", "#6DBA6E"],
      },
      {
        label: "ترکیبی از همه رنگ‌ها",
        value: "mixed",
        colors: ["#1F1F1F", "#D7B98E", "#557EAA", "#C56B7D"],
      },
    ],
  },
  {
    id: "male_wardrobe_palette",
    title: "بیشتر لباس‌های کمد شما در کدام پالت رنگی هستند؟",
    gender: "male",
    stage: 4,
    type: "single",
    visualType: "color-palette",
    scope: "request",
    required: true,

    options: [
      {
        label: "مشکی، سفید و خاکستری",
        value: "black_white_gray",
        colors: ["#111111", "#F5F5F5", "#777777", "#BEBEBE"],
      },
      {
        label: "کرم، بژ و قهوه‌ای",
        value: "cream_beige_brown",
        colors: ["#E8DDC7", "#D0B998", "#9B7656", "#5A3E2E"],
      },
      {
        label: "آبی، سرمه‌ای و طوسی",
        value: "blue_navy_gray",
        colors: ["#6F92B7", "#263F5E", "#737A83", "#A4A8AD"],
      },
      {
        label: "سبز، زیتونی و رنگ‌های خاکی",
        value: "green_olive_earthy",
        colors: ["#71865D", "#707745", "#9A805A", "#66533F"],
      },
      {
        label: "رنگ‌های تیره",
        value: "dark",
        colors: ["#1F2933", "#2C3138", "#343029", "#26362F"],
      },
      {
        label: "رنگ‌های روشن و شاد",
        value: "bright",
        colors: ["#E4C64A", "#D96A58", "#5B9FC9", "#72AA63"],
      },
      {
        label: "ترکیبی از همه رنگ‌ها",
        value: "mixed",
        colors: ["#1D1D1D", "#B48D68", "#557EA7", "#779665"],
      },
    ],
  },
  {
    id: "female_wardrobe_items",
    title:
      "کدام آیتم‌ها را در کمد خود دارید و دوست دارید در استایل استفاده شوند؟",
    gender: "female",
    stage: 4,
    type: "multiple",
    visualType: "text",
    scope: "request",
    required: true,
    maxSelections: 5,
    helperText: "حداکثر پنج گزینه را انتخاب کنید.",

    options: [
      {
        label: "مانتوی ساده یا کت بلند",
        value: "long_coat",
        //icon: "long_coat",
      },
      {
        label: "کت یا بلیزر",
        value: "blazer",
        //icon: "blazer",
      },
      {
        label: "شومیز یا پیراهن",
        value: "blouse",
        //icon: "blouse",
      },
      {
        label: "تی‌شرت یا تاپ ساده",
        value: "tshirt_top",
        //icon: "tshirt",
      },
      {
        label: "شلوار جین",
        value: "jeans",
        //icon: "jeans",
      },
      {
        label: "شلوار پارچه‌ای",
        value: "trousers",
        //icon: "trousers",
      },
      {
        label: "دامن",
        value: "skirt",
        //icon: "skirt",
      },
      {
        label: "کفش کتانی",
        value: "sneakers",
        //icon: "sneakers",
      },
      {
        label: "کفش رسمی یا پاشنه‌دار",
        value: "formal_shoes",
        //icon: "formal_shoes",
      },
      {
        label: "کیف ساده و روزمره",
        value: "bag",
        //icon: "bag",
      },
      {
        label: "ترجیح می‌دهم استایل کاملاً جدید پیشنهاد شود",
        value: "new_outfit",
        exclusive: true,
        //icon: "new_outfit",
      },
    ],
  },
  {
    id: "male_wardrobe_items",
    title:
      "کدام آیتم‌ها را در کمد خود دارید و دوست دارید در استایل استفاده شوند؟",
    gender: "male",
    stage: 4,
    type: "multiple",
    visualType: "text",
    scope: "request",
    required: true,
    maxSelections: 5,
    helperText: "حداکثر پنج گزینه را انتخاب کنید.",

    options: [
      {
        label: "تی‌شرت ساده",
        value: "tshirt",
        //icon: "tshirt",
      },
      {
        label: "پولوشرت",
        value: "polo",
        //icon: "polo",
      },
      {
        label: "پیراهن مردانه",
        value: "shirt",
        //icon: "shirt",
      },
      {
        label: "هودی یا سویشرت",
        value: "hoodie",
        //icon: "hoodie",
      },
      {
        label: "ژاکت یا بافت",
        value: "knitwear",
        //icon: "knitwear",
      },
      {
        label: "کت یا بلیزر",
        value: "blazer",
        //icon: "blazer",
      },
      {
        label: "کت جین یا اورشرت",
        value: "overshirt",
        //icon: "overshirt",
      },
      {
        label: "شلوار جین",
        value: "jeans",
        //icon: "jeans",
      },
      {
        label: "شلوار پارچه‌ای",
        value: "trousers",
        //icon: "trousers",
      },
      {
        label: "شلوار کارگو",
        value: "cargo",
        //icon: "cargo",
      },
      {
        label: "کتانی",
        value: "sneakers",
        //icon: "sneakers",
      },
      {
        label: "کفش رسمی یا لوفر",
        value: "formal_shoes",
        //icon: "formal_shoes",
      },
      {
        label: "ترجیح می‌دهم استایل کاملاً جدید پیشنهاد شود",
        value: "new_outfit",
        exclusive: true,
        //icon: "new_outfit",
      },
    ],
  },
  {
    id: "female_exploration_level",
    title: "دوست دارید پیشنهاد نهایی چقدر با استایل همیشگی شما متفاوت باشد؟",
    gender: "female",
    stage: 4,
    type: "single",
    visualType: "text",
    scope: "request",
    required: true,

    options: [
      {
        label: "کاملاً آشنا و نزدیک به استایل فعلی من",
        value: "very_familiar",
      },
      {
        label: "کمی متفاوت، اما همچنان قابل‌استفاده",
        value: "slightly_different",
      },
      {
        label: "ترکیبی از استایل فعلی و ایده‌های جدید",
        value: "balanced_exploration",
      },
      {
        label: "خلاقانه و متفاوت",
        value: "creative",
      },
      {
        label: "مطمئن نیستم",
        value: "unsure",
      },
    ],
  },
  {
    id: "male_exploration_level",
    title: "دوست دارید پیشنهاد نهایی چقدر با استایل همیشگی شما متفاوت باشد؟",
    gender: "male",
    stage: 4,
    type: "single",
    visualType: "text",
    scope: "request",
    required: true,

    options: [
      {
        label: "کاملاً نزدیک به استایل فعلی من",
        value: "very_familiar",
      },
      {
        label: "کمی متفاوت، اما قابل‌استفاده",
        value: "slightly_different",
      },
      {
        label: "ترکیبی از استایل همیشگی و ایده‌های جدید",
        value: "balanced_exploration",
      },
      {
        label: "خلاقانه و متفاوت",
        value: "creative",
      },
      {
        label: "جسورانه و خارج از انتخاب‌های معمول من",
        value: "bold",
      },
    ],
  },
];
