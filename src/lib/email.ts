type OrderEmailInput = { to: string; customerName: string; orderNumber: string; totalMinor: number; paymentStatus: string };

export async function sendOrderEmail(input: OrderEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: "not_configured" as const };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Iara Jewellery · Order ${input.orderNumber}`,
      html: `<p>Dear ${escapeHtml(input.customerName)},</p><p>Your Iara Jewellery order <strong>${input.orderNumber}</strong> has been received.</p><p>Total: HK$${(input.totalMinor / 100).toFixed(2)}<br/>Payment status: ${escapeHtml(input.paymentStatus)}</p><p>We will send another update when payment is confirmed and your piece is ready.</p>`
    })
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { sent: true as const };
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character); }
