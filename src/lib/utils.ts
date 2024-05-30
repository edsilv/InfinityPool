import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T, K extends keyof any>(
  arr: T[],
  resolver: (item: T) => K
): Record<K, T[]> {
  return arr.reduce(
    (memo, x) => {
      const key = resolver(x) || ("" as K);
      memo[key] = [...(memo[key] || []), x];
      return memo;
    },
    {} as Record<K, T[]>
  );
}
