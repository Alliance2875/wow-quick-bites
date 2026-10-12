"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import { cn } from "@/lib/format";
import { formatDate, formatTime } from "@/lib/portal/format";
import { ActionButton } from "./Action";

/**
 * Conversation of one client code. "Own" messages are on the right in the yellow bubble.
 * The unread divider is placed before the first message that was unread when the thread opened.
 */
export function ChatThread({
  messages,
  own,
  lang,
  authorLine,
  metaLine,
  dateLabel,
  unreadDivider,
  firstUnreadId,
  empty,
}: {
  messages: ChatMessage[];
  own: ChatMessage["from"];
  lang: Locale;
  authorLine: (message: ChatMessage) => string;
  metaLine: (message: ChatMessage) => string;
  dateLabel: (date: string) => string;
  unreadDivider?: string;
  firstUnreadId?: string;
  empty: string;
}) {
  const end = useRef<HTMLDivElement>(null);

  // Keep the latest message in view (inside the thread only, not the whole page)
  useEffect(() => {
    end.current?.parentElement?.scrollTo({ top: end.current.parentElement.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!messages.length) return <p className="py-10 text-center text-[0.8125rem] text-muted-foreground">{empty}</p>;

  return (
    <>
      {messages.map((message, i) => {
        const mine = message.from === own;
        const newDay = i === 0 || formatDate(messages[i - 1].sentAt) !== formatDate(message.sentAt);
        return (
          <div key={message.id}>
            {newDay && (
              <p className="mb-4 mt-1 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                {dateLabel(formatDate(message.sentAt))}
              </p>
            )}
            {message.id === firstUnreadId && unreadDivider && (
              <p className="my-5 flex items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-wide text-accent">
                <span className="h-px flex-1 bg-border" />
                {unreadDivider}
                <span className="h-px flex-1 bg-border" />
              </p>
            )}
            <div className={cn("mb-5 flex flex-col", mine ? "items-end" : "items-start")}>
              <p className="mb-1.5 text-[0.6875rem] text-muted-foreground">{authorLine(message)}</p>
              <p
                className={cn(
                  "max-w-[min(26rem,85%)] whitespace-pre-line rounded-lg px-4 py-3 text-[0.8125rem] leading-relaxed",
                  mine ? "bg-soft" : "bg-panel-muted light:bg-background",
                )}
              >
                {localize(message.text, lang)}
              </p>
              <p className="mt-1.5 text-[0.625rem] text-muted-foreground">
                {formatTime(message.sentAt)}
                {metaLine(message) && ` · ${metaLine(message)}`}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={end} />
    </>
  );
}

/** Reply box: textarea + hint + send button. Enter sends, Shift+Enter adds a line. */
export function ChatComposer({
  label,
  placeholder,
  hint,
  submit,
  onSend,
  disabled,
}: {
  label: string;
  placeholder: string;
  hint: string;
  submit: string;
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      className="border-t border-border p-5"
    >
      <label>
        <span className="mb-2 block text-[0.6875rem] text-muted-foreground">{label}</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-field px-3 py-2.5 text-[0.8125rem] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.6875rem] text-muted-foreground">{hint}</p>
        <ActionButton type="submit" variant="primary" disabled={disabled || !text.trim()}>
          {submit}
        </ActionButton>
      </div>
    </form>
  );
}
