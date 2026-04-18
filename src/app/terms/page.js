export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm">
        <strong>TEMPLATE — REVIEW BEFORE LAUNCH.</strong> This document is a
        starting template and has not been reviewed by an attorney. Have it
        reviewed for Oklahoma and federal compliance before accepting real
        customers or payments.
      </p>

      <p className="mt-6">
        Abstruse Drop Ship (the "Service") is operated by USA Track &amp;
        Reclaim LLC, a limited liability company with principal office at 9917
        Blue Wing Trl, Yukon, OK 73099.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Acceptance of Terms</h2>
      <p>
        By accessing or using Abstruse Drop Ship, you agree to be bound by these
        Terms of Service. If you do not agree, do not use the Service.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activity that occurs under your account.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Orders and Payment</h2>
      <p>
        Orders are fulfilled by third-party distributors. Payment is processed
        by PayPal. We reserve the right to refuse or cancel any order.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Shipping</h2>
      <p>
        Shipping times are estimates provided by distributors and are not
        guaranteed. Risk of loss transfers upon delivery to the carrier.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Returns</h2>
      <p>
        See our{" "}
        <a href="/refund" className="text-indigo-600 hover:underline">
          Refund &amp; Return Policy
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, USA Track &amp; Reclaim LLC and
        its affiliates are not liable for indirect, incidental, or consequential
        damages arising from use of the Service.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of Oklahoma, without
        regard to its conflict of law rules.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
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
