// Removido import de tipo específico do Strapi para compatibilidade de tipos
// import type { Lifecycle } from "@strapi/strapi";

// Tipos defensivos
type OrderItem = {
  id?: number;
  productId?: number;
  qty?: number;
  quantity?: number;
};

const orderLifecycle /* : any */ = {
  async beforeCreate(event: any) {
    const data = event.params?.data as Record<string, any>;
    const items = (data?.items as OrderItem[]) || [];
    if (!Array.isArray(items) || items.length === 0) return;

    const ids = Array.from(
      new Set(
        items
          .map((i) => Number(i.productId || i.id))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
    );
    if (ids.length === 0) return;

    const products = await strapi.db.query("api::product.product").findMany({
      where: { id: { $in: ids } },
      select: ["id", "stock", "active"],
    });
    const stockMap = new Map(products.map((p: any) => [p.id, p]));

    for (const it of items) {
      const pid = Number(it.productId || it.id);
      const qty = Number(it.qty || it.quantity || 1);
      const prod = stockMap.get(pid);
      if (!prod || prod.active === false)
        throw new Error(`Produto ${pid} indisponível`);
      if (qty <= 0) throw new Error(`Quantidade inválida para ${pid}`);
      if (Number(prod.stock || 0) < qty)
        throw new Error(`Estoque insuficiente para ${pid}`);
    }
  },

  async afterUpdate(event: any) {
    const updated = (event as any).result as Record<string, any> | null;
    if (!updated) return;
    const status = (updated as any).status;
    if (!status || !["paid", "confirmed"].includes(String(status))) return;

    const items = (updated.items as OrderItem[]) || [];
    const ids = Array.from(
      new Set(
        items
          .map((i) => Number(i.productId || i.id))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
    );
    if (ids.length === 0) return;

    const products = await strapi.db.query("api::product.product").findMany({
      where: { id: { $in: ids } },
      select: ["id", "stock"],
    });
    const stockMap = new Map(
      products.map((p: any) => [p.id, Number(p.stock || 0)]),
    );

    for (const it of items) {
      const pid = Number(it.productId || it.id);
      const qty = Number(it.qty || it.quantity || 1);
      const current = stockMap.get(pid);
      if (typeof current !== "number") continue;
      const next = Math.max(0, current - qty);
      await strapi.db.query("api::product.product").update({
        where: { id: pid },
        data: { stock: next },
      });
    }
  },
};

export default orderLifecycle;
