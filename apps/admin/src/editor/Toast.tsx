import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; description: string; variant?: "default" | "danger" | "success" }>>([]);

  const toast = (props: { title: string; description: string; variant?: "default" | "danger" | "success" }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, ...props }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { toast, toasts };
}
