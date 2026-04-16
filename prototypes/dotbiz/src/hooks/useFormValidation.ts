import { useState, useCallback } from "react";

interface ValidationRule {
  type: string;
  value?: unknown;
  message: string;
}

interface Validation {
  required?: boolean;
  rules?: ValidationRule[];
}

export function validateField(value: string, validation: Validation): string | null {
  if (validation.required && !value.trim()) {
    return validation.rules?.find(r => r.type === "required")?.message ?? "This field is required";
  }
  for (const rule of validation.rules ?? []) {
    switch (rule.type) {
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return rule.message;
        break;
      case "url":
        if (value && !/^https?:\/\/.+/.test(value)) return rule.message;
        break;
      case "minLength":
        if (value.length < Number(rule.value)) return rule.message;
        break;
      case "maxLength":
        if (value.length > Number(rule.value)) return rule.message;
        break;
      case "min":
        if (Number(value) < Number(rule.value)) return rule.message;
        break;
      case "max":
        if (Number(value) > Number(rule.value)) return rule.message;
        break;
      case "pattern":
        if (value && !new RegExp(String(rule.value)).test(value)) return rule.message;
        break;
    }
  }
  return null;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validate = useCallback((field: string, value: string, validation: Validation) => {
    const error = validateField(value, validation);
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  return { errors, validate, clearError };
}
