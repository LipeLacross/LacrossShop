/* Index mínimo & robusto (Strapi v5):
   - Libera leitura pública de category/product/page
   - SEED=true: upsert idempotente de Store/Category/Product/Page
   - Usa Document Service API (strapi.documents(...)) e preenche slug
   - Publica tudo (publishedAt) e mostra contagens no final
*/
type Strapi = any;

const nowISO = () => new Date().toISOString();
const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function upsertPermission(
  strapi: Strapi,
  roleId: number,
  action: string,
) {
  const q = strapi.db.query("plugin::users-permissions.permission");
  const existing = await q.findOne({ where: { action, role: roleId } });
  if (existing) {
    if (!existing.enabled)
      await q.update({ where: { id: existing.id }, data: { enabled: true } });
    return;
  }
  // Corrige: campo correto é 'role' (singular)
  await q.create({ data: { action, enabled: true, role: roleId } });
}

async function grantPublicRead(strapi: Strapi) {
  const role = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });
  if (!role) {
    strapi.log.warn('Papel "public" não encontrado – pulando permissões.');
    return;
  }
  for (const a of [
    "api::category.category.find",
    "api::category.category.findOne",
    "api::product.product.find",
    "api::product.product.findOne",
    "api::page.page.find",
    "api::page.page.findOne",
    // Cupons (somente leitura)
    "api::coupon.coupon.find",
    "api::coupon.coupon.findOne",
  ])
    await upsertPermission(strapi, role.id, a);

  // Rota segura: status do pedido por código (somente campos não sensíveis)
  await upsertPermission(strapi, role.id, "api::order.order.statusByCode");

  // Criação de pedido: permitir somente em DEV ou se explicitamente habilitado
  const allowCreate =
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_PUBLIC_ORDER_CREATE === "true";
  if (allowCreate) {
    await upsertPermission(strapi, role.id, "api::order.order.create");
    // Leitura de pedido (para página de status por código)
    await upsertPermission(strapi, role.id, "api::order.order.find");
    await upsertPermission(strapi, role.id, "api::order.order.findOne");
    strapi.log.info(
      "Permissões públicas para pedidos habilitadas (dev/explicit).",
    );
  } else {
    strapi.log.info(
      "Permissão pública de criação de pedidos desabilitada (produção).",
    );
  }

  strapi.log.info("Permissões públicas mínimas OK.");
}

/* ===== Helpers Document Service ===== */
const doc = (strapi: Strapi, uid: string) => strapi.documents(uid);

async function upsertPublished(
  strapi: Strapi,
  uid: string,
  where: any,
  data: any,
) {
  const svc = doc(strapi, uid);
  const existing = await svc.findFirst({
    params: { filters: where, publicationState: "preview" },
  });
  if (existing) {
    const toUpdate: Record<string, any> = {};
    for (const k of Object.keys(data)) {
      const before = existing[k];
      const after = data[k];
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        toUpdate[k] = after;
      }
    }
    if (!existing.publishedAt) {
      toUpdate.publishedAt = nowISO();
    }
    if (Object.keys(toUpdate).length) {
      const updated = await svc.update({
        documentId: existing.documentId,
        data: toUpdate,
      });
      return updated;
    }
    return existing;
  }
  return svc.create({ data: { ...data, publishedAt: nowISO() } });
}

/* ===== Seed ===== */
async function runSeed(strapi: Strapi) {
  strapi.log.info("Seed mínimo: iniciando…");

  // 1) Store
  const storeName = "NeoMercado Principal";
  const storeSlug = slugify(storeName);
  const store = await upsertPublished(
    strapi,
    "api::store.store",
    { slug: storeSlug },
    {
      name: storeName,
      slug: storeSlug,
      domain: "neomercado.com.br",
      description: "Loja principal do NeoMercado",
      active: true,
    },
  );
  strapi.log.info(`Store OK: ${store.name}`);

  // 2) Categories
  const catDefs = [
    {
      name: "Eletrônicos",
      description: "Tecnologia e gadgets",
      featured: true,
    },
    { name: "Moda", description: "Vestuário e acessórios", featured: false },
    {
      name: "Hidden Homepage Featured Items",
      description: "Categoria oculta para grid inicial",
      featured: false,
    },
    {
      name: "Hidden Homepage Carousel",
      description: "Categoria oculta para carrossel inicial",
      featured: false,
    },
  ];
  const cats: Record<string, any> = {};
  for (const c of catDefs) {
    const slug = slugify(c.name);
    const cat = await upsertPublished(
      strapi,
      "api::category.category",
      { slug },
      { ...c, slug, store: store.id },
    );
    cats[c.name] = cat;
    strapi.log.info(`Category OK: ${cat.name}`);
  }
  const linkCats = (names: string[]) => names.map((n) => ({ id: cats[n].id }));

  // 3) Products
  const prodDefs = [
    {
      name: "Fone Bluetooth X100",
      shortDescription: "Som estéreo, até 20h",
      description: "Fone sem fio com cancelamento de ruído básico.",
      price: 199.99,
      stock: 30,
      featured: true,
      active: true,
      categories: linkCats(["Eletrônicos"]),
    },
    {
      name: "Camiseta Básica Premium",
      shortDescription: "Algodão 100%",
      description: "Camiseta confortável, várias cores.",
      price: 39.9,
      stock: 50,
      featured: false,
      active: true,
      categories: linkCats(["Moda"]),
    },
    {
      name: "Notebook Ultrafino Demo",
      shortDescription: "Leve e potente",
      description: "Notebook demonstrativo para grid inicial.",
      price: 4599.9,
      stock: 10,
      featured: true,
      active: true,
      categories: linkCats(["Hidden Homepage Featured Items", "Eletrônicos"]),
    },
    {
      name: "Smartwatch Fitness Pro",
      shortDescription: "Monitoramento completo",
      description: "Relógio inteligente multi-esportivo.",
      price: 899.9,
      stock: 25,
      featured: true,
      active: true,
      categories: linkCats(["Hidden Homepage Featured Items", "Eletrônicos"]),
    },
    {
      name: "Headset Gamer RGB",
      shortDescription: "Som envolvente",
      description: "Headset com iluminação RGB e microfone.",
      price: 349.9,
      stock: 40,
      featured: true,
      active: true,
      categories: linkCats(["Hidden Homepage Featured Items", "Eletrônicos"]),
    },
    {
      name: "Teclado Mecânico TKL",
      shortDescription: "Switches azuis",
      description: "Teclado mecânico compacto para produtividade e games.",
      price: 499.9,
      stock: 35,
      featured: false,
      active: true,
      categories: linkCats(["Hidden Homepage Carousel", "Eletrônicos"]),
    },
    {
      name: "Mouse Wireless Precision",
      shortDescription: "Alto desempenho",
      description: "Mouse sem fio ergonômico com sensor de alta precisão.",
      price: 259.9,
      stock: 60,
      featured: false,
      active: true,
      categories: linkCats(["Hidden Homepage Carousel", "Eletrônicos"]),
    },
    {
      name: "Hub USB-C 8em1",
      shortDescription: "Expansão portátil",
      description: "Hub multifuncional com HDMI, USB 3.0 e PD.",
      price: 299.9,
      stock: 80,
      featured: false,
      active: true,
      categories: linkCats(["Hidden Homepage Carousel", "Eletrônicos"]),
    },
  ];

  for (const p of prodDefs) {
    const slug = slugify(p.name);
    const prod = await upsertPublished(
      strapi,
      "api::product.product",
      { slug },
      {
        name: p.name,
        slug,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        stock: p.stock,
        featured: p.featured,
        active: p.active,
        categories: p.categories, // array de { id }
        store: store.id, // id
      },
    );
    strapi.log.info(`Product OK: ${prod.name}`);
  }

  // 4) Pages
  const pages = [
    {
      title: "Quem Somos",
      bodySummary: "Sobre a loja",
      body: "<h2>Bem-vindo ao NeoMercado</h2><p>Loja demo com Strapi.</p>",
      featured: true,
    },
    {
      title: "Política de Privacidade",
      bodySummary: "Dados & privacidade",
      body: "<h2>Privacidade</h2><p>Seu texto aqui…</p>",
      featured: false,
    },
    {
      title: "Política de Devolução",
      bodySummary: "Trocas & devoluções",
      body: "<h2>Devoluções</h2><p>Descreva regras de devolução, prazos e condições.</p>",
      featured: false,
    },
  ];

  for (const pg of pages) {
    const slug = slugify(pg.title);
    const page = await upsertPublished(
      strapi,
      "api::page.page",
      { slug },
      { ...pg, slug, store: store.id },
    );
    strapi.log.info(`Page OK: ${page.title}`);
  }

  // 5) Contagem (log no console)
  const count = async (uid: string) =>
    strapi.db.query(uid).count({ where: {} });
  const [cStores, cCats, cProds, cPages] = await Promise.all([
    count("api::store.store"),
    count("api::category.category"),
    count("api::product.product"),
    count("api::page.page"),
  ]);
  strapi.log.info(
    `Resumo seed → stores:${cStores} categories:${cCats} products:${cProds} pages:${cPages}`,
  );
}

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Strapi }) {
    await grantPublicRead(strapi);
    if (process.env.SEED === "true") {
      try {
        await runSeed(strapi);
      } catch (e) {
        strapi.log.error("Seed falhou:", e);
      }
    }
  },
};
