import pagseguroPayment from 'pagseguro-payment';

const credentials = {
  email: process.env.PAGSEGURO_EMAIL!,
  token: process.env.PAGSEGURO_TOKEN!,
  auth: `https://ws.pagseguro.uol.com.br/${process.env.PAGSEGURO_ENVIRONMENT === 'sandbox' ? 'sandbox/' : ''}`,
  transactions: `https://ws.pagseguro.uol.com.br/${process.env.PAGSEGURO_ENVIRONMENT === 'sandbox' ? 'sandbox/' : ''}v2/transactions`,
  session: `https://ws.pagseguro.uol.com.br/${process.env.PAGSEGURO_ENVIRONMENT === 'sandbox' ? 'sandbox/' : ''}v2/sessions`,
};

const pagseguro = new pagseguroPayment(credentials);

/**
 * Cria uma transação de checkout transparente no PagSeguro.
 * @param items Array de itens com { id, description, amount, quantity }
 * @param reference Código de referência do pedido
 */
export function createPagSeguroTransaction(
  items: { id: string; description: string; amount: number; quantity: number }[],
  reference: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    pagseguro.payment.createTransaction(
      {
        currency: 'BRL',
        items,
        reference,
      },
      (err: any, transaction: any) => {
        if (err) return reject(err);
        // Retorna a URL para redirecionamento do usuário
        resolve(transaction.paymentLink);
      }
    );
  });
}

/**
 * Gera uma sessão (session ID) para checkout transparente.
 */
export function createPagSeguroSession(): Promise<string> {
  return new Promise((resolve, reject) => {
    pagseguro.utils.createSession((err: any, sessionId: string) => {
      if (err) return reject(err);
      resolve(sessionId);
    });
  });
}
