"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function CookieConsentInner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem("cookie:consent");
      if (!v) setOpen(true);
    } catch {}
  }, []);
  const accept = () => {
    try {
      localStorage.setItem("cookie:consent", "1");
    } catch {}
    setOpen(false);
  };
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-5xl rounded-t-lg border bg-white p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Usamos cookies para melhorar sua experiência. Ao continuar, você
          concorda com nossa Política de Privacidade.
        </p>
        <div className="flex gap-2">
          <Link
            href="/politica-de-privacidade"
            className="rounded border px-3 py-1 text-sm dark:border-neutral-700"
          >
            Saiba mais
          </Link>
          <button
            onClick={accept}
            className="rounded bg-black px-4 py-1 text-sm text-white dark:bg-white dark:text-black"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CookieConsent() {
  return <CookieConsentInner />;
}

export {};
