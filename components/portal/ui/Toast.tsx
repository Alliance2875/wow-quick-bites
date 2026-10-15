"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/shared/ui/Icon";

/** Short confirmation shown at the bottom of the screen ("ORD-1043 moved to Accepted"). */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const toast = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      {message && (
        <p className="pointer-events-auto flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-[0.8125rem] font-medium text-background shadow-lg">
          <Icon name="circleCheck" className="h-4 w-4 text-primary" />
          {message}
        </p>
      )}
    </div>
  );

  return { show, toast };
}
