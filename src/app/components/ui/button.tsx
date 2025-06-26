import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: string;
}

export function Button({ children, ...props }: Props) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 ${props.className}`}
    >
      {children}
    </button>
  );
}
