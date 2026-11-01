/**
 * Standard validation constants and limits across WorkNest platform.
 */
export const VALIDATION_RULES = {
  JOB: {
    TITLE_MIN: 10,
    TITLE_MAX: 120,
    DESCRIPTION_MIN: 30,
    DESCRIPTION_MAX: 10000,
    DELIVERABLES_MAX: 5000,
    BUDGET_MIN: 5,
    BUDGET_MAX: 1000000,
    SCREENING_QUESTION_MIN: 10,
    SCREENING_QUESTION_MAX: 300,
    SCREENING_QUESTIONS_MAX_COUNT: 10,
  },
  FREELANCER: {
    NAME_MIN: 2,
    NAME_MAX: 60,
    HEADLINE_MIN: 5,
    HEADLINE_MAX: 120,
    BIO_MIN: 30,
    BIO_MAX: 5000,
    HOURLY_RATE_MIN: 5,
    HOURLY_RATE_MAX: 1000,
    YEARS_EXP_MIN: 0,
    YEARS_EXP_MAX: 50,
    TAG_MIN: 2,
    TAG_MAX: 30,
    TAGS_MAX_COUNT: 15,
  },
  CLIENT: {
    COMPANY_NAME_MIN: 2,
    COMPANY_NAME_MAX: 100,
    ABOUT_MAX: 4000,
  },
  PROPOSAL: {
    COVER_LETTER_MIN: 20,
    COVER_LETTER_MAX: 5000,
  },
} as const;

/**
 * Validates a web URL format (allows http/https or bare domain with standard format).
 */
export function isValidUrl(url: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`,
    );
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
