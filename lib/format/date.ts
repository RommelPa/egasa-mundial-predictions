const DEFAULT_LOCALE = "es-PE";
const DEFAULT_TIME_ZONE = "America/Lima";

type FormatDateTimeOptions = {
  locale?: string;
  timeZone?: string;
  includeSeconds?: boolean;
};

export function formatDateTime(
  value: Date | string,
  options: FormatDateTimeOptions = {}
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  const {
    locale = DEFAULT_LOCALE,
    timeZone = DEFAULT_TIME_ZONE,
    includeSeconds = false,
  } = options;

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: true,
  }).format(date);
}

export function formatDateOnly(
  value: Date | string,
  locale = DEFAULT_LOCALE,
  timeZone = DEFAULT_TIME_ZONE
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTimeOnly(
  value: Date | string,
  locale = DEFAULT_LOCALE,
  timeZone = DEFAULT_TIME_ZONE
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Hora inválida";
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}