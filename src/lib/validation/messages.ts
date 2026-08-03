/**
 * Validation schemas are shared between the API and the react-hook-form
 * forms, but the two need messages in different languages. Instead of baking a
 * language into the schema, every message is a dictionary key under
 * `shop.validation.*`: the API resolves it against the Polish dictionary, the
 * UI against the active locale.
 */
export const V = {
  required: "required",
  email: "email",
  password: "password",
  phone: "phone",
  postalCode: "postalCode",
  quantity: "quantity",
  tooLong: "tooLong",
  message: "message",
  token: "token",
  terms: "terms",
} as const;

export type ValidationMessageKey = (typeof V)[keyof typeof V];

/** Polish fallbacks, used for API responses and whenever a key is unknown. */
export const VALIDATION_MESSAGES_PL: Record<ValidationMessageKey, string> = {
  required: "To pole jest wymagane",
  email: "Nieprawidłowy adres e-mail",
  password: "Hasło musi mieć min. 8 znaków oraz zawierać literę i cyfrę",
  phone: "Nieprawidłowy numer telefonu",
  postalCode: "Nieprawidłowy kod pocztowy (format 00-000)",
  quantity: "Nieprawidłowa ilość",
  tooLong: "Wartość jest za długa",
  message: "Wiadomość musi mieć co najmniej 10 znaków",
  token: "Nieprawidłowy token",
  terms: "Wymagana jest akceptacja",
};

export function isValidationMessageKey(
  value: string,
): value is ValidationMessageKey {
  return value in VALIDATION_MESSAGES_PL;
}

/** Resolves a schema message key to Polish; passes through unknown strings. */
export function toPolishMessage(message: string): string {
  return isValidationMessageKey(message)
    ? VALIDATION_MESSAGES_PL[message]
    : message;
}
