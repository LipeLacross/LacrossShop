/* global alert */
import React from "react";
import { Counter } from "./components/Counter";
import { ThemeToggleButton } from "@/theme/ThemeProvider";
import { Card } from "./components/ui/Card";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";

export default function App() {
  return (
    <div
      className="u-container"
      style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "clamp(1.75rem, 4vw, 2.6rem)" }}>
          React App Base{" "}
          <span
            style={{
              fontSize: "55%",
              fontWeight: 400,
              color: "var(--color-fg-muted)",
            }}
          >
            v0.1
          </span>
        </h1>
        <ThemeToggleButton />
      </header>

      <p style={{ maxWidth: 640, lineHeight: 1.5 }}>
        Projeto inicial em <strong>React + TypeScript + Vite</strong> melhorado
        com: theming (light/dark), componentes UI reutilizáveis, testes, alias
        de import (<code>@/</code>) e estrutura escalável.
      </p>

      <Stack direction="row" gap="1.5rem" wrap align="stretch">
        <Card style={{ flex: "1 1 280px" }} elevated>
          <h2 style={{ marginTop: 0 }}>Contador</h2>
          <p className="u-text-muted" style={{ marginTop: 0 }}>
            Hook simples demonstrando estado e testes.
          </p>
          <Counter initial={0} />
        </Card>

        <Card style={{ flex: "1 1 280px" }}>
          <h2 style={{ marginTop: 0 }}>Botões</h2>
          <Stack direction="row" gap=".75rem" wrap>
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
          </Stack>
        </Card>

        <Card style={{ flex: "1 1 280px" }}>
          <h2 style={{ marginTop: 0 }}>Acessibilidade</h2>
          <p className="u-text-muted" style={{ marginTop: 0 }}>
            Componentes com <code>aria-label</code>, testes usando Testing
            Library e sem estilos inline excessivos.
          </p>
          <Button onClick={() => alert("Exemplo de ação")}>Ação</Button>
        </Card>
      </Stack>

      <Card elevated padding="lg">
        <h2 style={{ marginTop: 0 }}>Próximos passos</h2>
        <ul style={{ marginTop: ".5rem", lineHeight: 1.4 }}>
          <li>Adicionar roteamento (ex: react-router).</li>
          <li>Configurar estado global (Zustand, Redux, Jotai...).</li>
          <li>Integração com backend / API GraphQL ou REST.</li>
          <li>Adicionar CI (lint + testes + cobertura).</li>
          <li>Configurar Storybook para documentação de componentes.</li>
        </ul>
      </Card>

      <footer
        style={{
          marginTop: "2rem",
          fontSize: ".8rem",
          opacity: 0.75,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          Gerado e aprimorado • Edite <code>src/App.tsx</code> para continuar.
        </p>
      </footer>
    </div>
  );
}
