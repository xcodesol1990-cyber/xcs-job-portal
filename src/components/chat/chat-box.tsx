"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { sendMessageAction } from "@/server/actions/messaging.actions";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
  sender: { id: string; name: string };
}

interface ChatBoxProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function ChatBox({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const currentText = text.trim();
    setText("");

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      body: currentText,
      createdAt: new Date(),
      sender: { id: currentUserId, name: "You" },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("body", currentText);

    startTransition(async () => {
      await sendMessageAction(null, formData);
    });
  };

  return (
    <div className="flex flex-col h-[520px]">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-zinc-100 text-zinc-900 rounded-bl-none dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {m.body}
              </div>
              <span className="mt-1 text-[10px] text-zinc-400">
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-zinc-100 p-4 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-950/20"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={!text.trim() || isPending}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 p-2.5 text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
