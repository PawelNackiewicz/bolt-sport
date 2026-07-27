/**
 * Central place to declare env vars the app depends on. Both `instrumentation.ts`
 * (startup log) and `app/global-not-found.tsx` (on-page/debug log) read this so
 * the two never drift out of sync.
 */
type EnvVarSpec = {
  name: string;
  required: boolean;
  /** Public vars are safe to print as-is; secret vars are only reported as set/missing + length. */
  secret: boolean;
};

const ENV_VARS: EnvVarSpec[] = [
  { name: "STORYBLOK_DELIVERY_API_TOKEN", required: true, secret: true },
  { name: "NEXT_PUBLIC_SITE_URL", required: false, secret: false },
];

export type EnvVarStatus = {
  name: string;
  required: boolean;
  present: boolean;
  /** Value for public vars, masked hint (e.g. "set (32 chars)") for secret vars, "MISSING" otherwise. */
  display: string;
};

export function checkEnv(): EnvVarStatus[] {
  return ENV_VARS.map(({ name, required, secret }) => {
    const value = process.env[name];
    const present = Boolean(value && value.length > 0);

    let display: string;
    if (!present) {
      display = "MISSING";
    } else if (secret) {
      display = `set (${value!.length} chars)`;
    } else {
      display = value!;
    }

    return { name, required, present, display };
  });
}

export function hasMissingRequiredEnv(statuses: EnvVarStatus[]): boolean {
  return statuses.some((status) => status.required && !status.present);
}
