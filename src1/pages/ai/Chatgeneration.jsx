import React, { useState, useRef, useEffect } from "react";
import { base_url } from "../../components/utlis";
import {
  Send,
  Download,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

const Chatgeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [loader, setLoader] = useState(false);

  const [chat, setChat] = useState([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loader]);

  // Download image
  const downloadImage = (base64Image) => {
    const link = document.createElement("a");

    link.href = `data:image/png;base64,${base64Image}`;

    link.download = `ai-image-${Date.now()}.png`;

    link.click();
  };

  const handelSubmit = async (e) => {
    if (
      (e.key === "Enter" || e.type === "click") &&
      prompt.trim().length > 2 &&
      !loader
    ) {
      e.preventDefault();

      const currentPrompt = prompt;

      setPrompt("");

      setLoader(true);

      // user message
      setChat((prev) => [
        ...prev,
        {
          role: "user",
          type: "text",
          content: currentPrompt,
        },
      ]);

      // create empty ai message
      const aiIndex = chat.length + 1;

      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          type: "text",
          content: "",
        },
      ]);

      try {
        const response = await fetch(
          `${base_url}/ai/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              contant: currentPrompt,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to generate response"
          );
        }

        const reader =
          response.body?.getReader();

        const decoder = new TextDecoder();

        let result = "";

        while (true) {
          const { done, value } =
            await reader.read();

          if (done) break;

          const chunk =
            decoder.decode(value);

          result += chunk;

          // live update ai text
          setChat((prev) =>
            prev.map((item, index) =>
              index === aiIndex
                ? {
                    ...item,
                    content: result,
                  }
                : item
            )
          );
        }
      } catch (error) {
        console.log(error);

        toast.error(
          "Error generating response"
        );
      } finally {
        setLoader(false);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-16 border-b bg-white flex items-center px-6 shrink-0">
        <Bot className="w-6 h-6 text-purple-600 mr-3" />

        <h2 className="text-lg font-semibold text-gray-800">
          AI Chat Assistant
        </h2>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {chat.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Bot className="w-16 h-16 mb-4 opacity-20" />

            <p>
              Ask anything to AI assistant...
            </p>
          </div>
        ) : (
          chat.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {/* AI */}
              {msg.role === "ai" && (
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
              )}

              {/* Message */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-tr-sm"
                    : "bg-white border border-gray-200 shadow-sm text-gray-800 rounded-tl-sm"
                }`}
              >
                {/* text */}
                {msg.type === "text" && (
                  <p>{msg.content}</p>
                )}

                {/* image */}
                {msg.type === "image" && (
                  <div className="relative group">
                    <img
                      src={`data:image/png;base64,${msg.content}`}
                      alt="ai"
                      className="rounded-xl max-w-sm"
                    />

                    <button
                      onClick={() =>
                        downloadImage(
                          msg.content
                        )
                      }
                      className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* user */}
              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}

        {/* loading */}
        {loader && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />

              <span className="text-sm text-gray-500">
                AI is typing...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={prompt}
            disabled={loader}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            onKeyDown={handelSubmit}
            placeholder="Ask anything..."
            className="w-full py-4 pl-5 pr-16 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handelSubmit}
            disabled={
              loader ||
              prompt.trim().length < 2
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white p-3 rounded-full transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatgeneration;