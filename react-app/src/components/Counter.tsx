import React from "react";
import { useCounter } from "../hooks/useCounter";

export interface CounterProps {
  initial?: number;
  step?: number;
}

export const Counter: React.FC<CounterProps> = ({ initial = 0, step = 1 }) => {
  const { value, inc, dec, reset } = useCounter(initial, step);
  return (
    <section aria-label="Contador" style={containerStyle}>
      <p style={valueStyle} data-testid="counter-value">
        {value}
      </p>
      <div style={buttonsRowStyle}>
        <button onClick={dec} aria-label="decrementar">
          -
        </button>
        <button onClick={inc} aria-label="incrementar">
          +
        </button>
        <button onClick={reset} aria-label="resetar">
          reset
        </button>
      </div>
    </section>
  );
};

const containerStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: ".75rem",
  width: 220,
  background: "#fafafa",
};

const valueStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "2.25rem",
  margin: 0,
  fontWeight: 600,
  letterSpacing: ".05em",
};

const buttonsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: ".5rem",
  justifyContent: "space-between",
};
