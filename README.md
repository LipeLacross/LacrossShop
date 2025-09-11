## 🌐 [English Version of README](README_EN.md)

# 🛍️ NeoMercado

NeoMercado é um **template de e-commerce headless full-stack** pronto para produção, integrando:

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, checkout sem cadastro, integração com pagamentos **Asaas** e frete **Melhor Envio**.  
- **Backend**: Strapi v5, com catálogo, cupons, pedidos, páginas institucionais e webhooks de pagamento.  

---

## 🔨 Funcionalidades do Projeto

- **Catálogo** com produtos, categorias, páginas institucionais.  
- **Busca** e coleções dinâmicas.  
- **Carrinho persistente** (localStorage + Context API).  
- **Checkout sem cadastro**: endereço, frete, cupom, pagamento.  
- **Pagamentos (Asaas)**:
  - Cartão de crédito (parcelado).  
  - PIX com QR Code.  
  - Boleto bancário.  
- **Frete (Melhor Envio)** com fallback local.  
- **Pós-compra**:
  - Página `/pedido/[code]` com polling automático.  
  - Webhook do Asaas confirmando/cancelando pedidos.  
  - E-mail de confirmação (SMTP opcional).  
- **Cupons de desconto** e frete grátis.  
- **SEO** básico + imagens remotas.  
- **Segurança**:
  - Criação pública de pedidos desativada em produção.  
  - Webhook com HMAC (`ASAAS_WEBHOOK_SECRET`).  
  - Permissões mínimas de leitura pública no Strapi.  

---

### 📸 Exemplo Visual do Projeto

<div align="center">
  <img src="https://github.com/user-attachments/assets/aefc9a29-6719-42a5-81b0-e055a3ae245b" 
       alt="Homepage do NeoMercado" 
       width="80%" 
       style="margin: 16px 0; border-radius: 10px;">
</div>

## ✔️ Técnicas e Tecnologias Utilizadas

- **Frontend**:  
  - Next.js 15, React 19  
  - Tailwind CSS v4  
  - Headless UI, Heroicons  
  - Sonner (toasts), Nodemailer  
  - Sentry (observabilidade opcional)  

- **Backend**:  
  - Strapi v5  
  - SQLite (default) ou PostgreSQL  
  - API Tokens + Roles & Permissions  
  - Lifecycles para validação/estoque  

- **Integrações**:  
  - Asaas (sandbox/production)  
  - Melhor Envio (opcional)  

---

## 📁 Estrutura do Projeto

```

.
\|-- src/app/ (Next.js frontend)
\|   |-- api/checkout, asaas/webhook, shipping/...
\|   |-- cart/, checkout/, pedido/\[code], search/
\|   |-- components/: cart, home, ui, grid, product
\|   |-- lib/: api (Strapi), asaas utils, email templates
|
\|-- my-ecommerce-backend/ (Strapi backend)
\|   |-- config/: server, database, admin, middlewares
\|   |-- src/api/: product, category, order, coupon, page...
\|   |-- src/index.ts: permissões públicas + seed inicial
\|   |-- public/uploads: mídia

````

---

## 🛠️ Abrir e rodar o projeto

### 1. Pré-requisitos
- **Node.js ≥ 18**  
- **pnpm** (recomendado) ou npm/yarn  
- Banco de dados SQLite (default) ou PostgreSQL  

### 2. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd neomercado
````

### 3. Backend (Strapi)

```bash
cd my-ecommerce-backend
cp .env.example .env
pnpm install
pnpm dev
```

> Use `SEED=true` na primeira execução para popular catálogo, categorias e páginas iniciais.

### 4. Frontend (Next.js)

```bash
cd ..
cp .env.example .env.local
pnpm install
pnpm dev
```

Acesse em: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy

### Frontend (Next.js)

* Deploy em **Vercel**, **Netlify** ou Docker.
* Defina variáveis de ambiente (`NEXT_PUBLIC_STRAPI_URL`, `ASAAS_API_KEY`, etc.) no painel.

### Backend (Strapi)

* Deploy em **Render**, **Heroku**, **Railway** ou Docker Compose.
* Configure banco de dados PostgreSQL para produção.
* Defina variáveis no servidor (`ADMIN_JWT_SECRET`, `DATABASE_URL`, `ASAAS_API_KEY`, etc.).
