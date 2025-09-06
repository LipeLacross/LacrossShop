import React from "react";
import clsx from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: ".5rem",
  fontWeight: 500,
  lineHeight: 1.1,
  position: "relative",
};

function styleFor(variant: ButtonProps["variant"]): React.CSSProperties {
  switch (variant) {
    case "outline":
      return {
        background: "transparent",
        border: "1px solid var(--color-border)",
      };
    case "ghost":
      return { background: "transparent", border: "1px solid transparent" };
    case "danger":
      return {
        background: "var(--color-danger)",
        border: "1px solid var(--color-danger)",
        color: "#fff",
      };
    default:
      return {};
  }
}

const sizeMap: Record<NonNullable<ButtonProps["size"]>, React.CSSProperties> = {
  sm: {
    padding: ".4rem .7rem",
    fontSize: ".8rem",
    borderRadius: "var(--radius-sm)",
  },
  md: {
    padding: ".55rem .9rem",
    fontSize: ".9rem",
    borderRadius: "var(--radius-md)",
  },
  lg: {
    padding: ".8rem 1.2rem",
    fontSize: "1rem",
    borderRadius: "var(--radius-lg)",
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "solid",
  size = "md",
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  className,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      className={clsx("ui-btn", className)}
      data-variant={variant}
      data-size={size}
      disabled={isDisabled}
      style={{
        ...base,
        ...sizeMap[size],
        ...styleFor(variant),
        opacity: isDisabled ? 0.7 : 1,
        ...style,
      }}
      {...rest}
    >
      {leftIcon && (
        <span className="btn-icon" aria-hidden>
          {leftIcon}
        </span>
      )}
      <span>{loading ? "..." : children}</span>
      {rightIcon && (
        <span className="btn-icon" aria-hidden>
          {rightIcon}
        </span>
      )}
    </button>
  );
};
