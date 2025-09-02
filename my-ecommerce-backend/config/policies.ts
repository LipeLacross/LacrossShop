export default {
  'api::store.store': {
    find: true,
    findOne: true,
  },
  'api::category.category': {
    find: true,
    findOne: true,
  },
  'api::product.product': {
    find: true,
    findOne: true,
  },
  'api::page.page': {
    find: true,
    findOne: true,
  },
  'api::customer.customer': {
    find: false,
    findOne: false,
    create: true,
    update: false,
    delete: false,
  },
  'api::order.order': {
    find: false,
    findOne: false,
    create: true,
    update: false,
    delete: false,
  },
  'api::payment.payment': {
    find: false,
    findOne: false,
    create: true,
    update: false,
    delete: false,
  },
  'api::order-item.order-item': {
    find: false,
    findOne: false,
    create: true,
    update: false,
    delete: false,
  },
};
