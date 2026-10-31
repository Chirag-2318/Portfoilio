"use client";

import * as React from "react";
import { useToaster } from "@/components/ui/Toaster";

export function useCopy() {
  const { toast } = useToaster();

  const copy = React.useCallback(
    async (text: string, message: string = "Email copied"): Promise<boolean> => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          toast(message);
          return true;
        }
        // Fallback for older browsers / insecure environments
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          toast(message);
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to copy:", err);
        return false;
      }
    },
    [toast]
  );

  return { copy };
}

