declare module "pagseguro-payment" {
  export default class PagSeguroPayment {
    constructor(credentials: {
      email: string;
      token: string;
      auth: string;
      transactions: string;
      session: string;
    });

    payment: {
      createTransaction: (
        options: unknown,
        callback: (err: unknown, transaction: unknown) => void,
      ) => void;
    };

    utils: {
      createSession: (
        callback: (err: unknown, sessionId: string) => void,
      ) => void;
    };
  }
}
