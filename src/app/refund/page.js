export const metadata = {
  title: "Refund & Return Policy",
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Refund &amp; Return Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm">
        <strong>TEMPLATE — REVIEW BEFORE LAUNCH.</strong> Your actual policy
        must match what you offer buyers, and PayPal's Seller Protection program
        has specific requirements. Have this reviewed by an attorney.
      </p>

      <p className="mt-6">
        This Refund &amp; Return Policy applies to purchases made through
        Abstruse Drop Ship, operated by USA Track &amp; Reclaim LLC.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Return Window</h2>
      <p>
        You may request a return within 30 days of delivery. Items must be
        unused, in original packaging, and with proof of purchase.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Non-Returnable Items</h2>
      <ul className="list-disc pl-6">
        <li>Perishable goods</li>
        <li>Custom or personalized items</li>
        <li>Items marked as final sale</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Refunds</h2>
      <p>
        Once your return is received and inspected, we will notify you of
        approval. Approved refunds are issued to the original PayPal account
        within 5–10 business days.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Damaged or Wrong Items</h2>
      <p>
        If your order arrives damaged or incorrect, contact us within 7 days of
        delivery with photos. We will arrange a replacement or refund at no
        cost to you.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Return Shipping</h2>
      <p>
        Return shipping costs are the buyer's responsibility unless the return
        is due to our error.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">How to Request</h2>
      <p>
        Email{" "}
        <a href="mailto:andrea@usatrackanreclaim.com" className="text-indigo-600 hover:underline">
          andrea@usatrackanreclaim.com
        </a>{" "}
        with your order number and reason for return.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        USA Track &amp; Reclaim LLC<br />
        9917 Blue Wing Trl<br />
        Yukon, OK 73099
      </p>
    </div>
  );
}
