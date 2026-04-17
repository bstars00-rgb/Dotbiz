import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormValidation } from "@/hooks/useFormValidation";

describe("useFormValidation", () => {
  it("should start with no errors", () => {
    const { result } = renderHook(() => useFormValidation());
    expect(result.current.errors).toEqual({});
  });

  it("should validate required field — empty", () => {
    const { result } = renderHook(() => useFormValidation());

    let error: string | null = null;
    act(() => {
      error = result.current.validate("name", "", {
        required: true,
        rules: [{ type: "required", message: "Name is required" }],
      });
    });

    expect(error).toBe("Name is required");
    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should validate required field — filled", () => {
    const { result } = renderHook(() => useFormValidation());

    let error: string | null = null;
    act(() => {
      error = result.current.validate("name", "John", {
        required: true,
        rules: [{ type: "required", message: "Name is required" }],
      });
    });

    expect(error).toBeNull();
    expect(result.current.errors.name).toBeNull();
  });

  it("should validate email format — invalid", () => {
    const { result } = renderHook(() => useFormValidation());

    let error: string | null = null;
    act(() => {
      error = result.current.validate("email", "not-an-email", {
        required: true,
        rules: [{ type: "email", message: "Valid email required" }],
      });
    });

    expect(error).toBe("Valid email required");
  });

  it("should validate email format — valid", () => {
    const { result } = renderHook(() => useFormValidation());

    let error: string | null = null;
    act(() => {
      error = result.current.validate("email", "user@example.com", {
        required: true,
        rules: [{ type: "email", message: "Valid email required" }],
      });
    });

    expect(error).toBeNull();
  });

  it("should clear previous errors on successful validation", () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.validate("name", "", {
        required: true,
        rules: [{ type: "required", message: "Required" }],
      });
    });
    expect(result.current.errors.name).toBe("Required");

    act(() => {
      result.current.validate("name", "Filled", {
        required: true,
        rules: [{ type: "required", message: "Required" }],
      });
    });
    expect(result.current.errors.name).toBeNull();
  });
});
