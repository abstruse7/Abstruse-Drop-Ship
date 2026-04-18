"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const BUTTON_ID = "US9WYEMJC3G9A";
const CLIENT_ID =
  "BAA2iC6Cm1pVPC35J7iRulmC_1lUwrj2pSAK6tKuHwv8TBeqzsFTjAW1ztNFfzudXknUKtV34u8vPVVKF4";

export default function BuyPage() {
  const rendered = useRef(false);

  function renderButton() {
    if (rendered.current) return;
    if (typeof window === "undefined" || !window.paypal?.HostedButtons) return;
    window.paypal
      .HostedButtons({ hostedButtonId: BUTTON_ID })
      .render(`#paypal-container-${BUTTON_ID}`);
    rendered.current = true;
  }

  useEffect(() => {
    renderButton();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Quick Buy
      </h1>
      <div id={`paypal-container-${BUTTON_ID}`} />
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&components=hosted-buttons&enable-funding=venmo&currency=USD`}
        strategy="afterInteractive"
        onLoad={renderButton}
      />
    </div>
  );
}
