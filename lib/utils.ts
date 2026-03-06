import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function formatPriceText(
  min: number | null | undefined,
  max?: number | null | undefined,
  fallback: string = "Liên hệ",
): string {
  const fmt = (n: number) => n.toLocaleString("vi-VN");
  const minVal = min ?? null;
  const maxVal = max ?? null;

  if (minVal === null && maxVal === null) return fallback;
  if (minVal !== null && maxVal !== null) {
    return minVal === maxVal
      ? `${fmt(minVal)}đ`
      : `${fmt(minVal)}đ - ${fmt(maxVal)}đ`;
  }
  if (minVal !== null) return `${fmt(minVal)}đ`;
  return `${fmt(maxVal as number)}đ`;
}
