import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order" as any,
  ({ strapi }) => ({
    async statusByCode(ctx) {
      try {
        const code = ctx.params?.code;
        if (!code || typeof code !== "string") {
          return ctx.badRequest("Missing order code");
        }

        // Usa Document Service (Strapi v5)
        const svc = (strapi as any).documents("api::order.order");
        const order = await svc.findFirst({
          params: {
            filters: { code },
            publicationState: "live",
            fields: ["code", "status", "paymentUrl", "createdAt"],
          },
        });

        if (!order) return ctx.notFound("Order not found");

        // Retorna campos seguros (não expõe dados sensíveis)
        ctx.body = {
          code: order.code,
          status: order.status || "pending",
          paymentUrl: order.paymentUrl || null,
          createdAt: order.createdAt || null,
        };
      } catch (e) {
        strapi.log.error("statusByCode error", e);
        return ctx.internalServerError("Internal error");
      }
    },
  }),
);
