import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  sm: "text-sm h-9 px-3.5",
  md: "text-[15px] h-11 px-5",
  lg: "text-base h-12 px-6",
};

const variants: Record<Variant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-sm",
  secondary: "bg-white text-ink-900 border border-ink-200 hover:bg-ink-50",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
  dark: "bg-ink-900 text-white hover:bg-black",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
