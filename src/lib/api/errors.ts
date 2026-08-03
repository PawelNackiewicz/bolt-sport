/**
 * Stable, language-independent error codes. The API always sends a Polish
 * `message` as a fallback, but clients are expected to key their own localised
 * copy off `code` — that is how one API serves the pl/de/en UI.
 *
 * This module intentionally has no imports so it can be used from client
 * components as well as route handlers.
 */
export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INVALID_CREDENTIALS",
  "EMAIL_TAKEN",
  "TOKEN_INVALID",
  "TOKEN_EXPIRED",
  "INSUFFICIENT_STOCK",
  "PRODUCT_NOT_PURCHASABLE",
  "CART_EMPTY",
  "CART_CHANGED",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID_CREDENTIALS: 401,
  EMAIL_TAKEN: 409,
  TOKEN_INVALID: 400,
  TOKEN_EXPIRED: 410,
  INSUFFICIENT_STOCK: 409,
  PRODUCT_NOT_PURCHASABLE: 400,
  CART_EMPTY: 400,
  CART_CHANGED: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export const ERROR_MESSAGES_PL: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Nieprawidłowe dane w formularzu",
  UNAUTHORIZED: "Musisz być zalogowany, aby wykonać tę operację",
  FORBIDDEN: "Nie masz dostępu do tego zasobu",
  NOT_FOUND: "Nie znaleziono zasobu",
  CONFLICT: "Operacja jest sprzeczna z aktualnym stanem",
  INVALID_CREDENTIALS: "Nieprawidłowy e-mail lub hasło",
  EMAIL_TAKEN: "Konto z tym adresem e-mail już istnieje",
  TOKEN_INVALID: "Token jest nieprawidłowy lub został już wykorzystany",
  TOKEN_EXPIRED: "Token wygasł — poproś o nowy link",
  INSUFFICIENT_STOCK: "Niewystarczający stan magazynowy",
  PRODUCT_NOT_PURCHASABLE: "Ten produkt wyceniamy indywidualnie — zapytaj o wycenę",
  CART_EMPTY: "Koszyk jest pusty",
  CART_CHANGED:
    "Dostępność produktów w koszyku zmieniła się — sprawdź koszyk i spróbuj ponownie",
  RATE_LIMITED: "Zbyt wiele żądań — spróbuj ponownie za chwilę",
  INTERNAL_ERROR: "Wystąpił nieoczekiwany błąd serwera",
};

export function isErrorCode(value: string): value is ErrorCode {
  return (ERROR_CODES as readonly string[]).includes(value);
}

/** Per-field messages, e.g. `{ email: "Nieprawidłowy adres e-mail" }`. */
export type FieldErrors = Record<string, string>;

/**
 * Values the client needs to build a localised sentence out of a bare code —
 * e.g. `{ available: 3 }` for `INSUFFICIENT_STOCK`. Without these the UI can
 * only ever show the generic message for the code, and the detail the handler
 * knew about is lost.
 */
export type ErrorParams = Record<string, string | number>;

export type ApiErrorOptions = {
  /** Polish wire message; overrides the default for this code. */
  message?: string;
  fields?: FieldErrors;
  params?: ErrorParams;
};

/** Thrown inside route handlers and converted to a response by `handleRoute`. */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly fields?: FieldErrors;
  readonly params?: ErrorParams;

  constructor(code: ErrorCode, options: ApiErrorOptions = {}) {
    super(options.message ?? ERROR_MESSAGES_PL[code]);
    this.name = "ApiError";
    this.code = code;
    this.fields = options.fields;
    this.params = options.params;
  }

  get status(): number {
    return ERROR_STATUS[this.code];
  }
}

/** Wire format of an error response. */
export type ApiErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    fields?: FieldErrors;
    params?: ErrorParams;
  };
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

/** Wire format of a success response. */
export type ApiSuccessBody<T> = {
  data: T;
  meta?: PaginationMeta;
};

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;
