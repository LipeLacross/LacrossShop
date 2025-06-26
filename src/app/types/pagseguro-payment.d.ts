declare module 'pagseguro-payment' {
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
        options: any,
        callback: (err: any, transaction: any) => void
      ) => void;
    };

    utils: {
      createSession: (callback: (err: any, sessionId: string) => void) => void;
    };
  }
}
