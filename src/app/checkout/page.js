"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from "@/components/storefront/CartProvider";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [shipping, setShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [showNewAddress, setShowNewAddress] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/addresses")
        .then((res) => res.json())
        .then((data) => {
          setAddresses(data.addresses || []);
          if (data.addresses?.length > 0) {
            setSelectedAddress(data.addresses[0].id);
          }
        });
    }
  }, [session]);

  // Fetch shipping rates when items change
  useEffect(() => {
    if (session && items.length > 0) {
      setShippingLoading(true);
      fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setShipping(data);
          setShippingLoading(false);
        })
        .catch(() => setShippingLoading(false));
    }
  }, [session, items]);

  async function handleAddAddress(e) {
    e.preventDefault();
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    const data = await res.json();
    if (data.address) {
      setAddresses((prev) => [...prev, data.address]);
      setSelectedAddress(data.address.id);
      setShowNewAddress(false);
      setNewAddress({ label: "", street: "", city: "", state: "", zip: "" });
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <Link
          href="/products"
          className="text-indigo-600 hover:underline"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const shippingCost = shipping?.shipping?.cost ?? 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Shipping
              {shipping?.shipping?.method && (
                <span className="text-gray-400 ml-1">
                  ({shipping.shipping.method})
                </span>
              )}
            </span>
            {shippingLoading ? (
              <span className="text-gray-400">Calculating...</span>
            ) : shippingCost === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span>${shippingCost.toFixed(2)}</span>
            )}
          </div>
          {shipping?.amountUntilFreeShipping > 0 && (
            <div className="text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
              Add ${shipping.amountUntilFreeShipping.toFixed(2)} more for free shipping!
            </div>
          )}
          {shipping?.shipping?.estimatedDays && (
            <div className="text-xs text-gray-500">
              Estimated delivery: {shipping.shipping.estimatedDays}
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Shipping Address
        </h2>

        {addresses.length > 0 && (
          <div className="space-y-2 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                  selectedAddress === addr.id
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={() => setSelectedAddress(addr.id)}
                  className="mt-1"
                />
                <div>
                  {addr.label && (
                    <span className="text-sm font-medium text-gray-900">
                      {addr.label}
                    </span>
                  )}
                  <p className="text-sm text-gray-600">
                    {addr.street}, {addr.city}, {addr.state} {addr.zip}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {!showNewAddress ? (
          <button
            onClick={() => setShowNewAddress(true)}
            className="text-sm text-indigo-600 hover:underline"
          >
            + Add New Address
          </button>
        ) : (
          <form onSubmit={handleAddAddress} className="space-y-3">
            <input
              type="text"
              placeholder="Label (e.g., Home, Office)"
              value={newAddress.label}
              onChange={(e) =>
                setNewAddress({ ...newAddress, label: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="Street Address"
              required
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                required
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="text"
                placeholder="State"
                required
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                required
                value={newAddress.zip}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, zip: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setShowNewAddress(false)}
                className="text-gray-600 px-4 py-2 text-sm hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {paymentError}
        </div>
      )}

      {/* PayPal Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
        {!selectedAddress ? (
          <p className="text-gray-500 text-sm">
            Please select a shipping address to continue.
          </p>
        ) : (
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "pay",
            }}
            createOrder={async () => {
              setPaymentError("");
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                  })),
                  shippingAddressId: selectedAddress,
                }),
              });
              const data = await res.json();
              if (data.error) {
                setPaymentError(data.error);
                throw new Error(data.error);
              }
              return data.orderID;
            }}
            onApprove={async (data) => {
              const res = await fetch("/api/checkout/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderID: data.orderID,
                  items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                  })),
                  shippingAddressId: selectedAddress,
                }),
              });
              const result = await res.json();
              if (result.success) {
                clearCart();
                router.push("/checkout/success");
              } else {
                setPaymentError(result.error || "Payment failed");
              }
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              setPaymentError("Payment was cancelled or failed. Please try again.");
            }}
          />
        )}
      </div>
    </div>
  );
}
