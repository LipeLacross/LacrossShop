# React App (Vite + TypeScript)

Base aprimorada e pronta para escalar.

## Stack
- React 18
- TypeScript 5
- Vite 5
- Vitest + Testing Library + Cobertura
- ESLint (flat) + React Hooks + React Refresh

## Destaques
- Theming (light/dark) com `<ThemeProvider />` e toggle persistido (localStorage)
- Variáveis CSS + modo escuro automático (system preference)
- Componentes reutilizáveis: `Button`, `Card`, `Stack`
- Hook de exemplo `useCounter`
- Testes cobrindo contador e tema
- Alias de import `@/*`
- Scripts adicionais (coverage, clean)
- Estrutura modular escalável

## Scripts
```
npm run dev         # Desenvolvimento
npm run build       # Build produção (dist/)
npm run preview     # Servir dist localmente
npm run lint        # Lint
npm run typecheck   # Checagem TS
npm test            # Testes (run)
npm run test:watch  # Testes em watch
npm run coverage    # Relatório de cobertura
npm run clean       # Limpa artefatos
```

## Estrutura
```
src/
  App.tsx
  main.tsx
  components/
    Counter.tsx
    Counter.test.tsx
    layout/Stack.tsx
    ui/Button.tsx
    ui/Card.tsx
  hooks/
    useCounter.ts
  theme/
    ThemeProvider.tsx
    ThemeProvider.test.tsx
  styles/
    global.css
```

## Theming
Use o toggle (botão no header) para alternar entre claro/escuro. O estado é salvo em `localStorage` (`app-theme`). Ajuste labels passando props para `ThemeToggleButton`.

## Testes
```
npm test
npx vitest --coverage
```
Inclui testes de:
- Contador (incremento, decremento, reset)
- Theming (toggle e modo inicial)

## Alias
Imports absolutos via `@/` configurados em `tsconfig.json` e `vite.config.ts`.

## Próximos Passos (Sugestões)
- Adicionar roteamento (`react-router-dom` ou outro)
- Estado global (Zustand, Redux, Jotai, Context Modules)
- Storybook para documentação de componentes
- Integração CI (lint + testes + cobertura em PRs)
- Suporte a i18n (react-intl / lingui / next-intl se migrar)
- Code-splitting + lazy boundaries

## Como começar
```
cd react-app
npm install --legacy-peer-deps
npm run dev
```
Acesse: http://localhost:5173

## Licença
Uso livre dentro do seu projeto.
