"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HelpChatProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function HelpChat({ isModal = false, onClose }: HelpChatProps) {
  const { t: tr } = useLang();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/help/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(tr("help.chat.error"));
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const userName = session?.user?.name?.split(" ")[0] || "there";

  const containerClass = isModal
    ? "flex flex-col w-full h-full bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden"
    : "flex flex-col w-full bg-white dark:bg-slate-900 border border-[#D8DEE6] dark:border-slate-700 rounded-lg shadow-md overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="font-semibold text-[#0A2540] dark:text-white">
          {tr("help.chat.title")}
        </h3>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Input Area — fixed at top so it never shifts */}
      <form
        onSubmit={handleSendMessage}
        className="px-4 pb-3 flex gap-2 border-b border-[#D8DEE6] dark:border-slate-700"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tr("help.chat.placeholder")}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm border border-[#D8DEE6] dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:bg-slate-800 dark:text-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 bg-[#0A2540] text-white rounded-lg hover:bg-[#0F3A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <Send size={15} />
        </button>
      </form>

      {/* Messages Area — scrolls internally, never pushes the frame */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center pt-2">
            Hi {userName}! {tr("help.chat.placeholder")}
          </p>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-[#0A2540] text-white rounded-br-none"
                      : "bg-[#F4F6F9] dark:bg-slate-800 text-[#0A2540] dark:text-white rounded-bl-none"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F4F6F9] dark:bg-slate-800 px-3 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
