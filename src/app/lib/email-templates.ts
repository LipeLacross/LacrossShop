export function orderReceivedTemplate(params: {
  name: string;
  orderCode: string;
  amount: number;
  itemsHtml?: string;
  shippingHtml?: string;
  paymentUrl?: string | null;
}) {
  const {
    name,
    orderCode,
    amount,
    itemsHtml = "",
    shippingHtml = "",
    paymentUrl,
  } = params;
  return `
    <h2>Pedido recebido</h2>
    <p>Olá, ${name}. Recebemos seu pedido no NeoMercado.</p>
    ${itemsHtml}
    ${shippingHtml}
    <p><strong>Total:</strong> R$ ${Number(amount).toFixed(2)}</p>
    ${paymentUrl ? `<p>Finalize o pagamento no link: <a href="${paymentUrl}">${paymentUrl}</a></p>` : ""}
    <p>Qualquer dúvida, responda este e-mail.</p>
  `;
}

export function orderPaidTemplate(params: { name: string; orderCode: string }) {
  const { name, orderCode } = params;
  return `
    <h2>Pagamento aprovado!</h2>
    <p>Olá, ${name}. Seu pedido (${orderCode}) foi confirmado e será processado em breve.</p>
  `;
}
