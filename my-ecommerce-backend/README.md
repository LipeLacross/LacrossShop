# 🚀 NeoMercado Backend (Strapi v5)

Backend completo para o sistema de e-commerce NeoMercado, construído com Strapi v5.

## ✨ Funcionalidades Implementadas

- ✅ **Content Types Completos**
  - Store (Lojas)
  - Category (Categorias)
  - Product (Produtos)
  - Customer (Clientes)
  - Order (Pedidos)
  - Payment (Pagamentos)
  - Order Item (Itens de Pedido)
  - Page (Páginas CMS)

- ✅ **Componentes Reutilizáveis**
  - Address (Endereço)
  - SEO
  - Dimensions (Dimensões)
  - Product Variant (Variantes de Produto)

- ✅ **Relacionamentos Configurados**
  - Loja ↔ Produtos, Categorias, Clientes, Pedidos
  - Categorias ↔ Produtos
  - Produtos ↔ Itens de Pedido
  - Pedidos ↔ Clientes, Pagamentos, Itens

- ✅ **Sistema de Pagamentos**
  - Múltiplos gateways (Asaas, Mercado Pago, Stripe)
  - Múltiplos métodos (Cartão, Boleto, PIX)
  - Sistema de parcelas

## 🛠️ Instalação

### 1. Dependências
```bash
npm install
```

### 2. Configuração de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=S0KIbk4knQP+HdpI+iRt2Q==,0ykzMons30AVDFGtNZhenQ==,Y6rzrZZOuBIe6waHnaUiuw==,7lWtjTKdwU4h737ZdflKBw==
API_TOKEN_SALT=HcMrOUhbKxgFA/iIq0qrlw==
ADMIN_JWT_SECRET=lM1n17DhTEvEKKbhtlmFBg==
TRANSFER_TOKEN_SALT=FDNl5EdGyyZN/a3W/yBLRg==
ENCRYPTION_KEY=q+jjyWP09luj13qJ0AcBrA==
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
DATABASE_SSL=false

# Opcional: Configurações de pagamento
ASAAS_API_KEY=sua_chave_aqui
ASAAS_ENVIRONMENT=sandbox
```

### 3. Iniciar o Servidor
```bash
npm run dev
```

O Strapi estará disponível em: http://localhost:1337

## 🗄️ Populando o Banco de Dados

### Executar o Seed
```bash
npm run seed
```

Este comando criará:
- 1 loja de exemplo
- 4 categorias (Eletrônicos, Roupas, Casa e Jardim, Esportes)
- 6 produtos de exemplo
- 2 páginas CMS

### Acessar o Admin
1. Acesse: http://localhost:1337/admin
2. Crie sua conta de administrador
3. Configure as permissões públicas para as APIs

## 🔐 Configuração de Permissões

### APIs Públicas (Leitura)
- `GET /api/stores` - Listar lojas
- `GET /api/categories` - Listar categorias
- `GET /api/products` - Listar produtos
- `GET /api/pages` - Listar páginas

### APIs Públicas (Criação)
- `POST /api/customers` - Criar cliente
- `POST /api/orders` - Criar pedido
- `POST /api/payments` - Criar pagamento
- `POST /api/order-items` - Criar item de pedido

## 📱 Endpoints Principais

### Produtos
```
GET /api/products?populate=images,categories
GET /api/products?filters[slug][$eq]=nome-do-produto&populate=images,categories
GET /api/products?filters[categories][id][$eq]=1&populate=images,categories
```

### Categorias
```
GET /api/categories?populate=products
GET /api/categories?filters[slug][$eq]=nome-da-categoria
```

### Busca
```
GET /api/products?filters[name][$containsi]=termo&populate=images,categories
```

## 🔧 Desenvolvimento

### Estrutura de Arquivos
```
src/
├── api/                    # Content Types
│   ├── store/
│   ├── category/
│   ├── product/
│   ├── customer/
│   ├── order/
│   ├── payment/
│   ├── order-item/
│   └── page/
├── components/             # Componentes reutilizáveis
│   ├── shared/
│   └── product/
└── config/                 # Configurações
    ├── database.ts
    ├── server.ts
    ├── middlewares.ts
    └── policies.ts
```

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm run start

# Console interativo
npm run console

# Seed do banco
npm run seed
```

## 🚀 Deploy

### Build
```bash
npm run build
```

### Produção
```bash
npm run start
```

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=sua_url_do_postgres
JWT_SECRET=chave_jwt_producao
```

## 📊 Monitoramento

### Logs
Os logs são exibidos no console durante o desenvolvimento.

### Health Check
```
GET /_health
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Strapi
2. Abra uma issue no repositório
3. Consulte os logs do servidor

---

**NeoMercado** - E-commerce moderno e escalável 🛍️
