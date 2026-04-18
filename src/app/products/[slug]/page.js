"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    setSelectedImage(0);
    setQuantity(1);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  function handleAddToCart() {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="bg-gray-200 h-96 rounded-xl" />
          <div>
            <div className="bg-gray-200 h-8 rounded w-3/4 mb-4" />
            <div className="bg-gray-200 h-6 rounded w-1/4 mb-6" />
            <div className="bg-gray-200 h-4 rounded w-full mb-2" />
            <div className="bg-gray-200 h-4 rounded w-full mb-2" />
            <div className="bg-gray-200 h-4 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>
        <Link href="/products" className="text-indigo-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/products" className="hover:text-indigo-600">
          Products
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <span>{product.category.name}</span>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div>
          <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-gray-400 text-lg">No image available</span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === i
                      ? "border-indigo-600"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          <p className="text-sm text-gray-500 mb-1">
            Sold by{" "}
            <span className="font-medium text-gray-700">
              {product.distributor?.companyName}
            </span>
          </p>

          {product.category && (
            <span className="inline-block text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded mb-4">
              {product.category.name}
            </span>
          )}

          <p className="text-3xl font-bold text-gray-900 my-4">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <span
              className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock} available)`
                : "Out of Stock"}
            </span>
            {product.sku && (
              <span className="text-sm text-gray-400">SKU: {product.sku}</span>
            )}
          </div>

          {/* Product Specs */}
          {(product.weight || product.length || product.width || product.height) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.weight && (
                  <div>
                    <span className="text-gray-500">Weight:</span>{" "}
                    <span className="text-gray-900">{product.weight} lbs</span>
                  </div>
                )}
                {product.length && (
                  <div>
                    <span className="text-gray-500">Length:</span>{" "}
                    <span className="text-gray-900">{product.length}&quot;</span>
                  </div>
                )}
                {product.width && (
                  <div>
                    <span className="text-gray-500">Width:</span>{" "}
                    <span className="text-gray-900">{product.width}&quot;</span>
                  </div>
                )}
                {product.height && (
                  <div>
                    <span className="text-gray-500">Height:</span>{" "}
                    <span className="text-gray-900">{product.height}&quot;</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/products/${rp.slug}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group"
              >
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  {rp.images?.[0] ? (
                    <img
                      src={rp.images[0]}
                      alt={rp.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition">
                    {rp.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {rp.distributor?.companyName}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    ${rp.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
