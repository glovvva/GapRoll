"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-slate-800 border border-slate-600 text-slate-100",
          title: "text-slate-100",
          description: "text-slate-300",
        },
      }}
    />
  );
}
