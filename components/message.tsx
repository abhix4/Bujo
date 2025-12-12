import { Message } from "@/types";
import { ComponentRenderer } from "./component-renderer";

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <>
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}
        >
          <MessageItem message={m} />
        </div>
      ))}
    </>
  );
}

function MessageItem({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";
  
  return (
    <div className={`max-w-[85%] ${isAssistant ? "max-w-full" : ""}`}>
      {message.text && (
        <div
          className={`rounded-2xl px-4 py-3 mb-2 ${
            isAssistant 
              ? "bg-white border border-gray-200 text-gray-900" 
              : "bg-[#323333] text-white"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          {/* {message.streaming && (
            <span className="inline-block w-1 h-4 bg-current ml-1" />
          )} */}
        </div>
      )}
      
      {message.componentSpec && (
        <div className="mt-2">
          <ComponentRenderer spec={message.componentSpec} />
        </div>
      )}
    </div>
  );
}