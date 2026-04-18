import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Dropshipping Made Simple
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Connect with trusted US distributors and start selling products
            without holding inventory. We handle the logistics so you can focus
            on growing your business.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Abstruse Drop Ship?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "No Inventory Risk",
                desc: "Products ship directly from distributors to your customers. No warehousing costs, no unsold stock.",
              },
              {
                title: "Trusted US Distributors",
                desc: "Every distributor on our platform is vetted and approved. Quality products, reliable fulfillment.",
              },
              {
                title: "Automated Order Routing",
                desc: "Orders are automatically routed to the right distributor. Real-time tracking for you and your customers.",
              },
              {
                title: "Competitive Pricing",
                desc: "Wholesale prices from distributors with transparent margins. Set your own retail prices.",
              },
              {
                title: "Fast US Shipping",
                desc: "All distributors are US-based. Most orders delivered within 3-5 business days.",
              },
              {
                title: "Easy Integration",
                desc: "API access to connect your own store. Or use our built-in storefront to start selling today.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-gray-400 mb-8">
            Join hundreds of sellers already using Abstruse Drop Ship to grow their
            businesses with zero inventory risk.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Seller Account
            </Link>
            <Link
              href="/auth/register?role=distributor"
              className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Become a Distributor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
