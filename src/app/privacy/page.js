export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm">
        <strong>TEMPLATE — REVIEW BEFORE LAUNCH.</strong> This document is a
        starting template and has not been reviewed by an attorney. If you
        collect data from California, EU, or UK residents, CCPA/GDPR-specific
        language is required. Have it reviewed before launch.
      </p>

      <p className="mt-6">
        This Privacy Policy applies to Abstruse Drop Ship, operated by USA
        Track &amp; Reclaim LLC ("we", "us", "our").
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <ul className="list-disc pl-6">
        <li>Account info: name, email, password (hashed with bcrypt)</li>
        <li>Order info: shipping address, products purchased, order history</li>
        <li>Payment info: handled by PayPal; we do not store card details</li>
        <li>Usage data: pages visited, device/browser info (via standard logs)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use It</h2>
      <ul className="list-disc pl-6">
        <li>To fulfill orders and provide the Service</li>
        <li>To communicate about your orders and account</li>
        <li>To improve the platform</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing</h2>
      <p>
        We share order details with the distributor fulfilling your order and
        with PayPal to process payment. We do not sell your personal
        information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies</h2>
      <p>
        We use cookies for authentication and cart persistence. Disabling
        cookies may prevent you from using core features.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Retention</h2>
      <p>
        We retain account and order data as long as your account is active or
        as needed to comply with legal obligations.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal
        data by emailing us at the address below.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact</h2>
      <p>
        USA Track &amp; Reclaim LLC<br />
        9917 Blue Wing Trl<br />
        Yukon, OK 73099<br />
        <a href="mailto:andrea@usatrackanreclaim.com" className="text-indigo-600 hover:underline">
          andrea@usatrackanreclaim.com
        </a>
      </p>
    </div>
  );
}
