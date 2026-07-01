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
    ? "flex flex-col w-full h-full bg-white dark:bg-slate-900 rounded-lg shadow-lg"
    : "flex flex-col w-full h-[500px] bg-white dark:bg-slate-900 border border-[#D8DEE6] dark:border-slate-700 rounded-lg shadow-md";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#D8DEE6] dark:border-slate-700">
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2 font-semibold">Hi {userName}!</p>
            <p className="text-sm">{tr("help.chat.placeholder")}</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
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
                <div className="bg-[#F4F6F9] dark:bg-slate-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg rounded-bl-none text-sm">
                  {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-[#D8DEE6] dark:border-slate-700 p-4 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tr("help.chat.placeholder")}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-[#D8DEE6] dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:bg-slate-800 dark:text-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-[#0A2540] text-white rounded-lg hover:bg-[#0F3A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
