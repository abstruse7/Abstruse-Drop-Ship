"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const statusDescriptions = {
  PENDING: "Order placed, awaiting processing",
  PROCESSING: "Distributor is preparing your order",
  SHIPPED: "Package is on the way",
  DELIVERED: "Package has been delivered",
  CANCELLED: "Order was cancelled",
  REFUNDED: "Order has been refunded",
};

function getStepIndex(status) {
  const idx = STATUS_STEPS.indexOf(status);
  return idx >= 0 ? idx : -1;
}

function OrderTimeline({ status }) {
  const currentStep = getStepIndex(status);
  const isCancelled = status === "CANCELLED" || status === "REFUNDED";

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <span className={`text-sm font-medium px-3 py-1 rounded ${statusColors[status]}`}>
          {status}
        </span>
        <p className="text-sm text-red-600 mt-2">{statusDescriptions[status]}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  isCompleted
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                } ${isCurrent ? "ring-4 ring-indigo-200" : ""}`}
              >
                {isCompleted && i < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isCompleted ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-1 rounded ${
                  i < currentStep ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session) {
      fetch(`/api/orders/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => {
          setOrder(data.order);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [session, id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <Link href="/orders" className="text-indigo-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Order Status</h2>
        <p className="text-sm text-gray-500 mb-6">{statusDescriptions[order.status]}</p>
        <OrderTimeline status={order.status} />
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 border border-gray-100 rounded-lg"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.product.images?.[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No img</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium text-gray-900 hover:text-indigo-600"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500">
                  by {item.distributor?.companyName}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} x ${item.unitPrice.toFixed(2)}
                </p>
                {/* Item-level tracking */}
                {item.trackingNumber && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tracking: {item.trackingUrl ? (
                      <a
                        href={item.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-purple-900"
                      >
                        {item.trackingNumber}
                      </a>
                    ) : (
                      item.trackingNumber
                    )}
                  </div>
                )}
                {item.status !== order.status && (
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">
                  ${item.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary & Shipping */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Payment Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              {order.shippingCost === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <span>${order.shippingCost.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            {order.paymentId && (
              <p className="text-xs text-gray-400 mt-2">
                Payment ID: {order.paymentId}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Shipping Address
          </h2>
          {order.shippingAddress && (
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.user?.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
