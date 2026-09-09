import { useState, useRef, useCallback } from "react";

// ─── Rule helpers ────────────────────────────────────────────────────────────

export const rules = {
  required: (label: string) => (v: string) =>
    v.trim() === "" ? `${label} is required` : null,

  email: () => (v: string) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v.trim())
      ? null
      : "Enter a valid email address",

  minLength: (n: number) => (v: string) =>
    v.length >= n ? null : `Must be at least ${n} characters`,

  digits: (label: string) => (v: string) =>
    /^\d+$/.test(v.trim()) ? null : `${label} must contain only digits`,

  match: (other: () => string, label: string) => (v: string) =>
    v === other() ? null : `${label} does not match`,
};

// Compose multiple rules — returns the first failing message or null
export function compose(
  ...fns: Array<(v: string) => string | null>
): (v: string) => string | null {
  return (v) => {
    for (const fn of fns) {
      const msg = fn(v);
      if (msg) return msg;
    }
    return null;
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

const AUTO_CLEAR_MS = 10_000;

type FieldKey = string;

interface FieldState {
  error: string | null;
}

/**
 * useFormValidation
 *
 * Manages per-field error state with:
 *  - on-submit validation of every field
 *  - immediate clear when the user edits the field
 *  - auto-clear after AUTO_CLEAR_MS if untouched
 */
export function useFormValidation<K extends FieldKey>(
  schema: Record<K, (value: string) => string | null>
) {
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
  // One timer ref per field
  const timers = useRef<Partial<Record<K, ReturnType<typeof setTimeout>>>>({});

  /** Clear the error + timer for a single field */
  const clearError = useCallback((field: K) => {
    clearTimeout(timers.current[field]);
    delete timers.current[field];
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  /** Set an error and start the auto-clear timer */
  const setFieldError = useCallback(
    (field: K, msg: string) => {
      clearTimeout(timers.current[field]);
      setErrors((prev) => ({ ...prev, [field]: msg }));
      timers.current[field] = setTimeout(() => clearError(field), AUTO_CLEAR_MS);
    },
    [clearError]
  );

  /**
   * Call this from an onChange handler so the error vanishes the moment the
   * user starts correcting the field.
   */
  const handleChange = useCallback(
    (field: K) => {
      clearError(field);
    },
    [clearError]
  );

  /**
   * Validate all fields against the provided values.
   * Returns true when every field passes (form may submit).
   */
  const validate = useCallback(
    (values: Record<K, string>): boolean => {
      let valid = true;
      for (const field of Object.keys(schema) as K[]) {
        const msg = schema[field](values[field] ?? "");
        if (msg) {
          setFieldError(field, msg);
          valid = false;
        } else {
          clearError(field);
        }
      }
      return valid;
    },
    [schema, setFieldError, clearError]
  );

  return { errors, validate, handleChange };
}
