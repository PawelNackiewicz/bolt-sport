import { z } from "zod";

import {
  DEFAULT_PER_PAGE,
  MAX_CART_ITEM_QUANTITY,
  MAX_PER_PAGE,
} from "@/src/lib/shop/constants";

import { V } from "./messages";

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

const requiredString = (max = 200) =>
  z.string().trim().min(1, { error: V.required }).max(max, { error: V.tooLong });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: V.required })
  .max(200, { error: V.tooLong })
  .pipe(z.email({ error: V.email }));

/**
 * Min. 8 characters with at least one letter and one digit. Expressed as a
 * single refinement so the user only ever sees one message for a weak password.
 */
export const passwordSchema = z
  .string()
  .min(1, { error: V.required })
  .max(100, { error: V.tooLong })
  .refine((value) => value.length >= 8 && /\d/.test(value) && /[a-zA-Z]/.test(value), {
    error: V.password,
  });

/** Permissive on formatting, strict on digit count (9+ after stripping). */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, { error: V.required })
  .max(30, { error: V.tooLong })
  .refine((value) => value.replace(/[^\d]/g, "").length >= 9, {
    error: V.phone,
  });

export const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, { error: V.tooLong })
  .refine((value) => value === "" || value.replace(/[^\d]/g, "").length >= 9, {
    error: V.phone,
  })
  .optional();

export const postalCodeSchema = z
  .string()
  .trim()
  .min(1, { error: V.required })
  .regex(/^\d{2}-\d{3}$/, { error: V.postalCode });

export const addressSchema = z.object({
  street: requiredString(200),
  postalCode: postalCodeSchema,
  city: requiredString(100),
  country: requiredString(100).default("Polska"),
});

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: requiredString(100),
  lastName: requiredString(100),
  phone: optionalPhoneSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  // Deliberately lax: an existing password only has to be non-empty here, the
  // real check is the hash comparison. Applying `passwordSchema` would leak
  // which rules the stored password satisfies.
  password: z.string().min(1, { error: V.required }),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, { error: V.token }),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { error: V.required }),
  newPassword: passwordSchema,
});

/* -------------------------------------------------------------------------- */
/*  Catalog                                                                   */
/* -------------------------------------------------------------------------- */

export const productSortSchema = z
  .enum(["price-asc", "price-desc", "newest", "name-asc"])
  .default("newest");

/**
 * Parses `searchParams`. Every field is optional and tolerant of junk — a bad
 * filter in a shared URL should degrade to the default listing, not a 400.
 */
export const productQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      const list = Array.isArray(value) ? value : value.split(",");
      const cleaned = list.map((tag) => tag.trim()).filter(Boolean);
      return cleaned.length > 0 ? cleaned : undefined;
    }),
  inStock: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === true || value === "true" || value === "1",
    ),
  sort: productSortSchema,
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
});

export const productSlugSchema = z.object({
  slug: z.string().trim().min(1),
});

/* -------------------------------------------------------------------------- */
/*  Cart                                                                      */
/* -------------------------------------------------------------------------- */

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1, { error: V.required }),
  quantity: z.coerce
    .number({ error: V.quantity })
    .int({ error: V.quantity })
    .min(1, { error: V.quantity })
    .max(MAX_CART_ITEM_QUANTITY, { error: V.quantity })
    .default(1),
});

/** `0` is allowed and means "remove this line". */
export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number({ error: V.quantity })
    .int({ error: V.quantity })
    .min(0, { error: V.quantity })
    .max(MAX_CART_ITEM_QUANTITY, { error: V.quantity }),
});

/* -------------------------------------------------------------------------- */
/*  Checkout                                                                  */
/* -------------------------------------------------------------------------- */

export const paymentMethodSchema = z.enum(["card", "transfer", "cod"], {
  error: V.required,
});

export const checkoutCustomerSchema = z.object({
  email: emailSchema,
  firstName: requiredString(100),
  lastName: requiredString(100),
  phone: phoneSchema,
  company: z.string().trim().max(200, { error: V.tooLong }).optional(),
});

export const createOrderSchema = z.object({
  customer: checkoutCustomerSchema,
  shippingAddress: addressSchema,
  /** Omitted means "same as shipping". */
  billingAddress: addressSchema.optional(),
  paymentMethod: paymentMethodSchema,
  notes: z.string().trim().max(1000, { error: V.tooLong }).optional(),
});

/**
 * The checkout form is one flat object bound to react-hook-form; it adds the
 * "billing same as shipping" toggle that the API contract does not need.
 */
export const checkoutFormSchema = createOrderSchema
  .extend({
    billingSameAsShipping: z.boolean().default(true),
  })
  .refine(
    (value) => value.billingSameAsShipping || value.billingAddress !== undefined,
    { error: V.required, path: ["billingAddress"] },
  );

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(MAX_PER_PAGE).default(10),
});

/* -------------------------------------------------------------------------- */
/*  Quotes                                                                    */
/* -------------------------------------------------------------------------- */

export const quoteTypeSchema = z.enum(
  ["ring", "klatka", "wyposazenie-sali", "hurt"],
  { error: V.required },
);

export const createQuoteSchema = z.object({
  name: requiredString(150),
  company: z.string().trim().max(200, { error: V.tooLong }).optional(),
  email: emailSchema,
  phone: phoneSchema,
  productId: z.string().trim().max(100).optional(),
  message: z
    .string()
    .trim()
    .min(10, { error: V.message })
    .max(2000, { error: V.tooLong }),
  type: quoteTypeSchema,
});

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                            */
/* -------------------------------------------------------------------------- */

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormValues = z.output<typeof checkoutFormSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
