## 🌐 [Versão em Português do README](README.md)

# 🛍️ NeoMercado

NeoMercado is a **headless e-commerce full-stack template** ready for production, integrating:

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, passwordless checkout, integration with **Asaas payments** and **Melhor Envio shipping**.  
- **Backend**: Strapi v5 with catalog, coupons, orders, institutional pages, and payment webhooks.

---

## 🔨 Project Features

- **Catalog** with products, categories, and institutional pages.  
- **Search** and dynamic collections.  
- **Persistent cart** (localStorage + Context API).  
- **Passwordless checkout**: address, shipping, coupon, payment.  
- **Payments (Asaas)**:
  - Credit card (installments).  
  - PIX with QR Code.  
  - Boleto bancário (bank slip).  
- **Shipping (Melhor Envio)** with local fallback.  
- **Post-purchase**:
  - `/pedido/[code]` page with automatic polling.  
  - Asaas webhook confirming/canceling orders.  
  - Order confirmation email (optional SMTP).  
- **Coupons** for discount and free shipping.  
- **Basic SEO** + remote images.  
- **Security**:
  - Public order creation disabled in production.  
  - Webhook with HMAC (`ASAAS_WEBHOOK_SECRET`).  
  - Minimum public read permissions in Strapi.  

---

### 📸 Visual Example of the Project

<div align="center">
  <img src="https://github.com/user-attachments/assets/aefc9a29-6719-42a5-81b0-e055a3ae245b" 
       alt="NeoMercado Homepage" 
       width="80%" 
       style="margin: 16px 0; border-radius: 10px;">
</div>

---

## ✔️ Tech Stack

- **Frontend**:  
  - Next.js 15, React 19  
  - Tailwind CSS v4  
  - Headless UI, Heroicons  
  - Sonner (toasts), Nodemailer  
  - Sentry (optional observability)  

- **Backend**:  
  - Strapi v5  
  - SQLite (default) or PostgreSQL  
  - API Tokens + Roles & Permissions  
  - Lifecycles for validation/stock control  

- **Integrations**:  
  - Asaas (sandbox/production)  
  - Melhor Envio (optional)  

---

## 📁 Project Structure

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
\|   |-- src/index.ts: public permissions + seed
\|   |-- public/uploads: media

````

---

## 🛠️ Run the Project Locally

### 1. Requirements
- **Node.js ≥ 18**  
- **pnpm** (recommended) or npm/yarn  
- SQLite database (default) or PostgreSQL  

### 2. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd neomercado
````

### 3. Backend (Strapi)

```bash
cd my-ecommerce-backend
cp .env.example .env
pnpm install
pnpm dev
```

> Use `SEED=true` only on the first run to populate catalog, categories, and initial pages.

### 4. Frontend (Next.js)

```bash
cd ..
cp .env.example .env.local
pnpm install
pnpm dev
```

Access at: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy

### Frontend (Next.js)

* Deploy on **Vercel**, **Netlify**, or Docker.
* Define environment variables (`NEXT_PUBLIC_STRAPI_URL`, `ASAAS_API_KEY`, etc.) in the hosting panel.

### Backend (Strapi)

* Deploy on **Render**, **Heroku**, **Railway**, or Docker Compose.
* Configure PostgreSQL for production.
* Set environment variables on the server (`ADMIN_JWT_SECRET`, `DATABASE_URL`, `ASAAS_API_KEY`, etc.).
