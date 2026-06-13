import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export const signalSchema = z.object({
  symbol: z.string().min(2).max(12),
  side: z.enum(["BUY", "SELL"]),
  entry: z.coerce.number().positive(),
  stopLoss: z.coerce.number().positive(),
  takeProfit: z.coerce.number().positive(),
  confidence: z.coerce.number().min(0).max(100),
});

const optionalPrice = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().positive().nullable(),
);

const optionalPoints = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().nullable(),
);

export const createAdminSignalSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(2, "Symbol must be at least 2 characters.")
      .max(12)
      .transform((value) => value.toUpperCase()),
    direction: z.enum(["BUY", "SELL", "WAIT"]),
    entry: optionalPrice,
    stopLoss: optionalPrice,
    tp1: optionalPrice,
    tp2: optionalPrice,
    tp3: optionalPrice,
    confidence: z.coerce.number().int().min(0).max(100),
    bias: z.string().trim().min(3, "Market bias is required.").max(180),
    reason: z.string().trim().min(10, "Add a clear ICT/SMC reason.").max(2000),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.direction === "WAIT") {
      return;
    }

    for (const field of ["entry", "stopLoss", "tp1", "tp2", "tp3"] as const) {
      if (value[field] === null) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `${field} is required for ${value.direction} signals.`,
        });
      }
    }
  });

export const updateAdminSignalSchema = z
  .object({
    status: z.enum(["ACTIVE", "CLOSED", "EXPIRED"]),
    result: z.enum(["TP1", "TP2", "TP3", "SL", "BE", "PENDING"]),
    stopLoss: optionalPrice,
    tp1: optionalPrice,
    tp2: optionalPrice,
    tp3: optionalPrice,
    points: optionalPoints,
  })
  .superRefine((value, context) => {
    if (value.status === "CLOSED" && value.result === "PENDING") {
      context.addIssue({
        code: "custom",
        path: ["result"],
        message: "Select a final result before closing the signal.",
      });
    }
  });

export const razorpayCheckoutVerificationSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const botPrice = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().positive().nullable(),
);

export const botPublishSignalSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(2, "Symbol must be at least 2 characters.")
      .max(12)
      .transform((value) => value.toUpperCase()),
    direction: z.enum(["BUY", "SELL", "WAIT"]),
    entry: botPrice,
    stopLoss: botPrice,
    tp1: botPrice,
    tp2: botPrice,
    tp3: botPrice,
    confidence: z.coerce.number().int().min(0).max(100),
    bias: z.string().trim().min(3).max(180),
    reason: z.string().trim().min(10).max(2000),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.direction === "WAIT") {
      return;
    }

    for (const field of ["entry", "stopLoss", "tp1", "tp2", "tp3"] as const) {
      if (value[field] === null) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `${field} is required for ${value.direction} signals.`,
        });
      }
    }
  });

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(24),
  NEXTAUTH_URL: z.string().url().optional(),
});
