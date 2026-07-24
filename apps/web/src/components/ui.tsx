import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      suppressHydrationWarning
      className={cn(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-forest",
        className,
      )}
      {...props}
    />
  );
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mint", className)} />;
}
