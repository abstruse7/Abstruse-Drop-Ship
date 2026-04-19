import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "Abstruse Drop Ship <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "andrea@usatrackanreclaim.com";

export async function sendOrderConfirmation({
  to,
  orderNumber,
  items,
  subtotal,
  tax,
  shippingCost,
  total,
  shippingAddress,
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping order confirmation email");
    return { skipped: true };
  }

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${i.name} × ${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">$${(i.unitPrice * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const addressBlock = shippingAddress
    ? `${shippingAddress.street}<br>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`
    : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <h1 style="color:#4f46e5">Order Confirmed</h1>
      <p>Thanks for your order! Your order number is <strong>${orderNumber}</strong>.</p>

      <h2 style="font-size:16px;margin-top:24px">Items</h2>
      <table style="width:100%;border-collapse:collapse">
        ${itemRows}
      </table>

      <table style="width:100%;margin-top:16px;font-size:14px">
        <tr><td>Subtotal</td><td style="text-align:right">$${subtotal.toFixed(2)}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right">$${shippingCost.toFixed(2)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right">$${tax.toFixed(2)}</td></tr>
        <tr style="font-weight:bold;font-size:16px"><td style="padding-top:8px">Total</td><td style="text-align:right;padding-top:8px">$${total.toFixed(2)}</td></tr>
      </table>

      ${addressBlock ? `<h2 style="font-size:16px;margin-top:24px">Shipping To</h2><p>${addressBlock}</p>` : ""}

      <p style="margin-top:32px;color:#6b7280;font-size:14px">
        Questions? Reply to this email or contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
      </p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">
        Abstruse Drop Ship · USA Track &amp; Reclaim LLC · 9917 Blue Wing Trl, Yukon, OK 73099
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmed: ${orderNumber}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error };
    }
    return { id: data?.id };
  } catch (err) {
    console.error("Email send failed:", err);
    return { error: err.message };
  }
}
