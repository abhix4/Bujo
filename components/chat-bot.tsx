"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, MessageCircleDashed, Send, X } from "lucide-react";
import { mockStreamResponse } from "../utils/mock/mock-stream";
import { Message } from "@/types";
import { MessageList } from "./message";
import { motion } from "motion/react"

export default function UiLibraryAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change
   useEffect(() => {
    try {
      const raw = localStorage.getItem("chat");
      if (raw) setMessages(JSON.parse(raw));
    } catch (e) {}
     if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);



  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(messages));
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages,open]);

  async function handleSend() {
    if (!input.trim() || isStreaming) return;
    
    const userMsg: Message = {
      id: String(Date.now()) + "-u",
      role: "user",
      text: input,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantId = String(Date.now()) + "-a";
    setMessages((m) => [
      ...m,
      {
        id: assistantId,
        role: "assistant",
        text: "",
        streaming: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    let fullText = "";
    
    try {
      for await (const chunk of mockStreamResponse(userMsg.text || "")) {
        fullText += chunk;
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, text: fullText } : msg
          )
        );
      }

      // Parse component after streaming completes
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== assistantId) return msg;
          
          const jsonMatch = fullText.match(/```COMPONENT_JSON\n([\s\S]+?)\n```/);
          if (jsonMatch) {
            try {
              const spec = JSON.parse(jsonMatch[1]);
              // Extract intro text (everything before the JSON block)
              const introText = fullText.substring(0, jsonMatch.index).trim();
              return { 
                ...msg, 
                text: introText,
                componentSpec: spec, 
                streaming: false 
              };
            } catch (e) {
              console.error("Failed to parse component JSON:", e);
              return { ...msg, streaming: false };
            }
          }
          return { ...msg, streaming: false };
        })
      );
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId 
            ? { ...msg, text: "Sorry, something went wrong.", streaming: false }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div>
      {/* Launcher button */}
      <motion.button
        className="fixed right-4 bottom-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#323333]  text-white shadow-lg transition-all md:right-8 md:bottom-6 md:h-16 md:w-16"
        onClick={() => setOpen((s) => !s)}
        aria-label={open ? "Close chat" : "Open chat"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        
      >
        {open ? <MessageCircleDashed className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      {/* Panel */}
      {open && (
        <motion.div className="fixed right-0 bottom-20 flex h-150 w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#E5E7EA] bg-[#FEFEFF] shadow-2xl md:right-8 md:bottom-24"
        initial={{ scale: 0.9, opacity: 0 , translateY: 20}}
        animate={{ scale: 1, opacity: 1 , translateY: 0}}
        transition={{ type: "spring", stiffness: 1000, damping: 30, duration: 0.05 }}
        >
          <div className="flex items-start justify-between border-b border-[#E5E7EA] px-5 py-4 bg-white">
            <div>
              <p className="text-xl font-semibold text-gray-900">Hi 👋</p>
              <p className="text-sm text-gray-600">How can I help?</p>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-md text-gray-500">
                  Try asking <br /> "Show me buttons" or "Create a form"
                </p>
              </div>
            ) : (
              <MessageList messages={messages} />
            )}
          </div>

          <div className="border-t border-[#E5E7EA] p-4 bg-white">
            <div className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                placeholder="Send a message..."
                disabled={isStreaming}
              />

              <button 
                onClick={handleSend} 
                className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isStreaming || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}


