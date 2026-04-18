"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default function DistributorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    sku: "",
    stock: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "DISTRIBUTOR") {
      router.push("/");
    } else {
      fetchData();
    }
  }, [session, status]);

  async function fetchData() {
    setLoading(true);
    const [productsRes, ordersRes] = await Promise.all([
      fetch("/api/distributor/products"),
      fetch("/api/orders"),
    ]);
    const productsData = await productsRes.json();
    const ordersData = await ordersRes.json();
    setProducts(productsData.products || []);
    setOrders(ordersData.orders || []);
    setLoading(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const slug = newProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const res = await fetch("/api/distributor/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProduct, slug }),
    });

    if (res.ok) {
      setShowAddProduct(false);
      setNewProduct({ name: "", description: "", price: "", costPrice: "", sku: "", stock: "" });
      fetchData();
    }
  }

  async function handleUpdateOrderItem(itemId, updateData) {
    setUpdatingItem(itemId);
    const res = await fetch(`/api/distributor/orders/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (res.ok) {
      await fetchData();
    }
    setUpdatingItem(null);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const pendingCount = orders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.status === "PENDING").length,
    0
  );
  const shippedCount = orders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.status === "SHIPPED").length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Distributor Dashboard
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Pending Items</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Shipped Items</p>
          <p className="text-3xl font-bold text-purple-600">{shippedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
        </div>
      </div>

      {/* Products */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
          >
            {showAddProduct ? "Cancel" : "Add Product"}
          </button>
        </div>

        {showAddProduct && (
          <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl border border-gray-200 mb-6 grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="SKU"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Retail Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cost Price"
              value={newProduct.costPrice}
              onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
              rows={3}
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition md:col-span-2"
            >
              Save Product
            </button>
          </form>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
            No products yet. Click &quot;Add Product&quot; to get started.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">SKU</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${product.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Management */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Management</h2>
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.user?.name} &middot;{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.shippingAddress && (
                      <p className="text-xs text-gray-400 mt-1">
                        Ship to: {order.shippingAddress.street},{" "}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {order.items.map((item) => (
                    <OrderItemRow
                      key={item.id}
                      item={item}
                      updating={updatingItem === item.id}
                      onUpdate={(data) => handleUpdateOrderItem(item.id, data)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderItemRow({ item, updating, onUpdate }) {
  const [showTracking, setShowTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(item.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(item.trackingUrl || "");

  function handleStatusChange(newStatus) {
    onUpdate({ status: newStatus });
  }

  function handleSaveTracking(e) {
    e.preventDefault();
    onUpdate({ trackingNumber, trackingUrl, status: "SHIPPED" });
    setShowTracking(false);
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-gray-900 text-sm">
            {item.product.name}
          </span>
          <span className="text-gray-500 text-sm ml-2">
            x {item.quantity} &middot; ${item.totalPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${statusColors[item.status]}`}>
            {item.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {item.status === "PENDING" && (
          <button
            onClick={() => handleStatusChange("PROCESSING")}
            disabled={updating}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Mark Processing"}
          </button>
        )}
        {(item.status === "PENDING" || item.status === "PROCESSING") && (
          <button
            onClick={() => setShowTracking(!showTracking)}
            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            {showTracking ? "Cancel" : "Add Tracking & Ship"}
          </button>
        )}
        {item.status === "SHIPPED" && (
          <button
            onClick={() => handleStatusChange("DELIVERED")}
            disabled={updating}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Mark Delivered"}
          </button>
        )}
        {item.trackingNumber && (
          <span className="text-xs text-purple-600">
            Tracking: {item.trackingNumber}
          </span>
        )}
      </div>

      {showTracking && (
        <form onSubmit={handleSaveTracking} className="flex flex-wrap gap-2 mt-1">
          <input
            type="text"
            placeholder="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
            className="px-3 py-1 border border-gray-300 rounded text-sm flex-1 min-w-[150px] outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="url"
            placeholder="Tracking URL (optional)"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm flex-1 min-w-[150px] outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={updating}
            className="text-xs bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {updating ? "Saving..." : "Ship with Tracking"}
          </button>
        </form>
      )}
    </div>
  );
}
