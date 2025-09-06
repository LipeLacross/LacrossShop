import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

describe("Counter component", () => {
  it("renders initial value", () => {
    render(<Counter initial={5} />);
    expect(screen.getByTestId("counter-value")).toHaveTextContent("5");
  });

  it("increments and decrements", async () => {
    const user = userEvent.setup();
    render(<Counter initial={0} step={2} />);
    const incBtn = screen.getByRole("button", { name: /incrementar/i });
    const decBtn = screen.getByRole("button", { name: /decrementar/i });
    const value = () => screen.getByTestId("counter-value");

    await user.click(incBtn);
    expect(value()).toHaveTextContent("2");
    await user.click(incBtn);
    expect(value()).toHaveTextContent("4");
    await user.click(decBtn);
    expect(value()).toHaveTextContent("2");
  });

  it("resets value", async () => {
    const user = userEvent.setup();
    render(<Counter initial={3} />);
    const incBtn = screen.getByRole("button", { name: /incrementar/i });
    const resetBtn = screen.getByRole("button", { name: /resetar/i });

    await user.click(incBtn);
    expect(screen.getByTestId("counter-value")).toHaveTextContent("4");
    await user.click(resetBtn);
    expect(screen.getByTestId("counter-value")).toHaveTextContent("3");
  });
});
