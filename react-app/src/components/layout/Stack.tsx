import React from "react";
import clsx from "clsx";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  gap?: number | string;
  wrap?: boolean;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  fullWidth?: boolean;
}

export const Stack: React.FC<StackProps> = ({
  direction = "column",
  gap = "1rem",
  wrap = false,
  align,
  justify,
  fullWidth,
  style,
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={clsx("ui-stack", className)}
      style={{
        display: "flex",
        flexDirection: direction,
        flexWrap: wrap ? "wrap" : "nowrap",
        gap,
        alignItems: align,
        justifyContent: justify,
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
