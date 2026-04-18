"use client";

import { SessionProvider } from "next-auth/react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { CartProvider } from "@/components/storefront/CartProvider";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: "USD",
          intent: "capture",
        }}
      >
        <CartProvider>{children}</CartProvider>
      </PayPalScriptProvider>
    </SessionProvider>
  );
}
