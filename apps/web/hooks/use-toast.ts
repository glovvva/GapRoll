"use client";

import { toast as sonnerToast } from "sonner";

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  return {
    toast: (opts: ToastOptions) => {
      const title = opts.title ?? "";
      const description = opts.description;
      const duration = opts.duration ?? 4000;
      sonnerToast.success(title, {
        description,
        duration,
      });
    },
  };
}
