export default {
  routes: [
    {
      method: "GET",
      path: "/orders/status/:code",
      handler: "order.statusByCode",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
