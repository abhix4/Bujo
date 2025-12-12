"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, MessageCircleDashed, Send, X, Trash2 } from "lucide-react";
import { mockStreamResponse } from "../utils/mock/mock-stream";
import { Message } from "@/types";
import { MessageList } from "./message";
import { motion } from "motion/react";
import { ChatDatabase } from "@/utils/db";

const MAX_MESSAGES = 1000;
const MESSAGES_PER_PAGE = 50;


const chatDB = new ChatDatabase();

export default function UiLibraryAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Initialize database and load messages
  useEffect(() => {
    let mounted = true;

    async function initializeChat() {
      try {
        await chatDB.init();
        const loadedMessages = await chatDB.getMessages(MESSAGES_PER_PAGE);
        const count = await chatDB.count();
        
        if (mounted) {
          setMessages(loadedMessages);
          setMessageCount(count);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeChat();

    return () => {
      mounted = false;
    };
  }, []);

  // Update message count when messages change
  useEffect(() => {
    async function updateCount() {
      try {
        const count = await chatDB.count();
        setMessageCount(count);
      } catch (error) {
        console.error("Failed to update message count:", error);
      }
    }

    if (!isLoading) {
      updateCount();
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (listRef.current && open) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Save message to IndexedDB
  const saveMessage = useCallback(async (message: Message) => {
    try {
      await chatDB.saveMessage(message);
      const count = await chatDB.count();
      if (count > MAX_MESSAGES) {
        await chatDB.deleteOldMessages(MAX_MESSAGES);
      }
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  }, []);

  // Clear all messages
  const handleClearChat = useCallback(async () => {
    if (!confirm("Are you sure you want to clear all messages?")) return;

    try {
      await chatDB.clearAll();
      setMessages([]);
      setMessageCount(0);
    } catch (error) {
      console.error("Failed to clear messages:", error);
    }
  }, []);

  // Load more messages (for infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    try {
      const allMessages = await chatDB.getMessages();
      setMessages(allMessages);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    }
  }, []);

  // Handle scroll to load older messages
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop } = listRef.current;
    if (scrollTop < 100 && messages.length < messageCount) {
      loadMoreMessages();
    }
  }, [messages.length, messageCount, loadMoreMessages]);


  // Handle sending a message
  async function handleSend() {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: String(Date.now()) + "-u",
      role: "user",
      text: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
  
    saveMessage(userMsg);

    setInput("");
    setIsStreaming(true);

    const assistantId = String(Date.now()) + "-a";
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
      streaming: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, assistantMsg]);

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
      const finalMessage = await new Promise<Message>((resolve) => {
        setMessages((prev) => {
          const updated = prev.map((msg) => {
            if (msg.id !== assistantId) return msg;

            const jsonMatch = fullText.match(/```COMPONENT_JSON\n([\s\S]+?)\n```/);
            if (jsonMatch) {
              try {
                const spec = JSON.parse(jsonMatch[1]);
                const introText = fullText.substring(0, jsonMatch.index).trim();
                const finalMsg = {
                  ...msg,
                  text: introText,
                  componentSpec: spec,
                  streaming: false,
                };
                resolve(finalMsg);
                return finalMsg;
              } catch (e) {
                console.error("Failed to parse component JSON:", e);
                const finalMsg = { ...msg, streaming: false };
                resolve(finalMsg);
                return finalMsg;
              }
            }
            const finalMsg = { ...msg, streaming: false };
            resolve(finalMsg);
            return finalMsg;
          });
          return updated;
        });
      });

      // Save final assistant message to IndexedDB
      saveMessage(finalMessage);

    } catch (error) {
      console.error("Streaming error:", error);
      const errorMsg: Message = {
        id: assistantId,
        role: "assistant",
        text: "Sorry, something went wrong.",
        streaming: false,
        createdAt: new Date().toISOString(),
      };
      
      setMessages((prev) =>
        prev.map((msg) => (msg.id === assistantId ? errorMsg : msg))
      );
      
      saveMessage(errorMsg);
    } finally {
      setIsStreaming(false);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed right-4 bottom-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      {/* Launcher button */}
      <motion.button
        className="fixed right-4 bottom-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#323333] text-white shadow-lg transition-all md:right-8 md:bottom-6 md:h-16 md:w-16"
        onClick={() => setOpen((s) => !s)}
        aria-label={open ? "Close chat" : "Open chat"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <MessageCircleDashed className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </motion.button>

      {/* Panel */}
      {open && (
        <motion.div
          className="fixed right-0 bottom-20 flex h-150 w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#E5E7EA] bg-[#FEFEFF] shadow-2xl md:right-8 md:bottom-24"
          initial={{ scale: 0.9, opacity: 0, translateY: 20 }}
          animate={{ scale: 1, opacity: 1, translateY: 0 }}
          transition={{
            type: "spring",
            stiffness: 1000,
            damping: 30,
            duration: 0.05,
          }}
        >
          <div className="flex items-start justify-between border-b border-[#E5E7EA] px-5 py-4 bg-white">
            <div>
              <p className="text-xl font-semibold text-gray-900">Hi 👋</p>
              <p className="text-sm text-gray-600">
                How can I help? ({messageCount}/{MAX_MESSAGES} messages)
              </p>
            </div>
            <div className="flex gap-2">
              {messageCount > 0 && (
                <button
                  onClick={handleClearChat}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Clear chat"
                  title="Clear all messages"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 space-y-4 overflow-auto p-4 bg-gray-50"
          >
            {messages.length < messageCount && (
              <button
                onClick={loadMoreMessages}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Load older messages
              </button>
            )}
            
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
              
              />

              <button
                onClick={handleSend}
              
                className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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