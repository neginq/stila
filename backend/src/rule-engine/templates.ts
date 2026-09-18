import {
    ClothingSlot,
    CoverageLevel,
    FormalityLevel,
    Gender,
    Occasion,
    Season,
} from "../../generated/prisma/client"
import type { RecommendationContext } from "./context"

export type OutfitTemplate = {
    required: ClothingSlot[]
    optional: ClothingSlot[]
}

const BASE_TEMPLATES: Record<Occasion, OutfitTemplate> = {
    [Occasion.DAILY]: {
        required: [ClothingSlot.TOP, ClothingSlot.BOTTOM, ClothingSlot.SHOES],
        optional: [ClothingSlot.OUTERWEAR, ClothingSlot.ACCESSORY],
    },
    [Occasion.UNIVERSITY]: {
        required: [ClothingSlot.TOP, ClothingSlot.BOTTOM, ClothingSlot.SHOES],
        optional: [ClothingSlot.OUTERWEAR, ClothingSlot.ACCESSORY],
    },
    [Occasion.WORK]: {
        required: [ClothingSlot.TOP, ClothingSlot.BOTTOM, ClothingSlot.SHOES],
        optional: [ClothingSlot.OUTERWEAR, ClothingSlot.ACCESSORY],
    },
    [Occasion.FRIENDS_GATHERING]: {
        required: [ClothingSlot.TOP, ClothingSlot.BOTTOM, ClothingSlot.SHOES],
        optional: [ClothingSlot.OUTERWEAR, ClothingSlot.ACCESSORY],
    },
    [Occasion.PARTY]: {
        required: [ClothingSlot.TOP, ClothingSlot.BOTTOM, ClothingSlot.SHOES, ClothingSlot.OUTERWEAR],
        optional: [ClothingSlot.ACCESSORY],
    },
    [Occasion.DATE_CAFE]: {
        required: [ClothingSlot.TOP, ClothingSlot.BOTTOM, ClothingSlot.SHOES],
        optional: [ClothingSlot.OUTERWEAR, ClothingSlot.ACCESSORY],
    },
    [Occasion.FORMAL_EVENT]: {
        required: [
            ClothingSlot.TOP,
            ClothingSlot.BOTTOM,
            ClothingSlot.OUTERWEAR,
            ClothingSlot.SHOES,
        ],
        optional: [ClothingSlot.ACCESSORY],
    },
    [Occasion.TRAVEL]: {
        required: [ClothingSlot.TOP, ClothingSlot.BOTTOM, ClothingSlot.SHOES],
        optional: [ClothingSlot.OUTERWEAR, ClothingSlot.ACCESSORY],
    },
}

/** Returns a copy of a template so later mutations do not change the shared base. */
function cloneTemplate(template: OutfitTemplate): OutfitTemplate {
    return {
        required: [...template.required],
        optional: [...template.optional],
    }
}

/** Promotes a slot from optional to required if it is not already required. */
function moveOptionalToRequired(template: OutfitTemplate, slot: ClothingSlot): void {
    if (template.required.includes(slot)) {
        return
    }
    template.optional = template.optional.filter((s) => s !== slot)
    template.required.push(slot)
}

/**
 * Resolve the outfit slot template for this recommendation context.
 * Occasion sets the base; season / coverage / formality may promote outerwear to required.
 */
export function resolveOutfitTemplate(ctx: RecommendationContext): OutfitTemplate {
    const template = cloneTemplate(BASE_TEMPLATES[ctx.occasion])

    // Cold seasons: prefer a layer
    if (ctx.season === Season.WINTER || ctx.season === Season.FALL) {
        moveOptionalToRequired(template, ClothingSlot.OUTERWEAR)
    }

    // Women with high coverage: outerwear (often manto) should be present
    if (
        ctx.gender === Gender.FEMALE &&
        (ctx.coverageLevel === CoverageLevel.FULLY_COVERED ||
            ctx.coverageLevel === CoverageLevel.COVERED_COMFORTABLE)
    ) {
        moveOptionalToRequired(template, ClothingSlot.OUTERWEAR)
    }

    // Smart-casual / formal work: include a structured layer
    if (
        ctx.occasion === Occasion.WORK &&
        (ctx.formalityLevel === FormalityLevel.SMART_CASUAL ||
            ctx.formalityLevel === FormalityLevel.FORMAL)
    ) {
        moveOptionalToRequired(template, ClothingSlot.OUTERWEAR)
    }

    return template
}

/** Returns required and optional slots as a single list. */
export function allTemplateSlots(template: OutfitTemplate): ClothingSlot[] {
    return [...template.required, ...template.optional]
}
