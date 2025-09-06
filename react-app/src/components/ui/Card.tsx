import React from "react";

export interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  elevated?: boolean;
  padding?: "md" | "lg";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated,
  padding = "md",
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        borderRadius: 8,
        background: "var(--color-bg-card, var(--color-bg, #fff))",
        padding: padding === "lg" ? "2rem" : "1rem",
        boxShadow: elevated
          ? "0 4px 14px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow .15s ease, transform .15s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card;
