"use client";

import { useState, type ComponentProps } from "react";
import { TextField } from "@/components/shared/ui/Field";
import Icon from "@/components/shared/ui/Icon";

/** Password input with a show/hide (eye) button. */
export default function PasswordField({
  labels,
  ...props
}: Omit<ComponentProps<typeof TextField>, "type" | "trailing"> & { labels: { show: string; hide: string } }) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? labels.hide : labels.show}
          aria-pressed={visible}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon name={visible ? "x" : "eye"} className="h-4 w-4" />
        </button>
      }
    />
  );
}
