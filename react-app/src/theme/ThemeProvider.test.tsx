import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ThemeProvider, ThemeToggleButton } from "./ThemeProvider";

// Helper to read current html data-theme
const getMode = () => document.documentElement.getAttribute("data-theme");

describe("ThemeProvider", () => {
  it("aplica modo inicial fornecido", () => {
    render(
      <ThemeProvider defaultMode="light">
        <ThemeToggleButton />
      </ThemeProvider>,
    );
    expect(getMode()).toBe("light");
  });

  it("alterna entre light e dark", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultMode="light">
        <ThemeToggleButton />
      </ThemeProvider>,
    );
    const btn = screen.getByTestId("theme-toggle");
    expect(getMode()).toBe("light");
    await user.click(btn);
    expect(getMode()).toBe("dark");
    await user.click(btn);
    expect(getMode()).toBe("light");
  });
});
