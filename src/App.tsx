import React, { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Send, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { ChatMessage as ChatMessageComponent } from "./components/ChatMessage";
import { ThinkingAnimation } from "./components/ThinkingAnimation";
import { EmptyState } from "./components/EmptyState";
import { 
  GoogleSheetsService, 
  KnowledgeBaseService, 
  ChatService,
  TelegramService,
  SupportTicketService,
  FriendlyResponseService,
  AssistanceService,
  LanguageService,
  type ChatMessage as ChatMessageType 
} from "./services";

interface Message {
  id: number;
  type: "user" | "ai";
  message: string;
  meta?: MessageMeta;
}

interface MessageMeta {
  details?: string[];
  timestamp?: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const apiKeyRef = useRef<string>(
    import.meta.env.VITE_OPENROUTER_API_KEY ?? import.meta.env.REACT_APP_OPENROUTER_API_KEY ?? ""
  );
  const refererRef = useRef<string>(
    import.meta.env.VITE_OPENROUTER_REFERER ?? import.meta.env.REACT_APP_OPENROUTER_REFERER ?? ""
  );
  const titleRef = useRef<string>(
    import.meta.env.VITE_OPENROUTER_TITLE ?? import.meta.env.REACT_APP_OPENROUTER_TITLE ?? ""
  );

  // Google Sheets configuration
  const googleSheetsApiKeyRef = useRef<string>(
    import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ?? ""
  );
  const googleSheetIdRef = useRef<string>(
    import.meta.env.VITE_GOOGLE_SHEET_ID ?? ""
  );
  const googleSheetRangeRef = useRef<string>(
    import.meta.env.VITE_GOOGLE_SHEET_RANGE ?? "Sheet1"
  );

  // Telegram configuration
  const telegramBotTokenRef = useRef<string>(
    import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? ""
  );
  const telegramChatIdRef = useRef<string>(
    import.meta.env.VITE_TELEGRAM_CHAT_ID ?? ""
  );

  // Services
  const googleSheetsServiceRef = useRef<GoogleSheetsService | null>(null);
  const knowledgeBaseServiceRef = useRef<KnowledgeBaseService>(new KnowledgeBaseService());
  const telegramServiceRef = useRef<TelegramService | null>(null);
  const supportTicketServiceRef = useRef<SupportTicketService | null>(null);
  const friendlyResponseServiceRef = useRef<FriendlyResponseService>(new FriendlyResponseService());
  const assistanceServiceRef = useRef<AssistanceService>(new AssistanceService());
  const languageServiceRef = useRef<LanguageService>(new LanguageService());
  const chatServiceRef = useRef<ChatService | null>(null);
  const conversationHistoryRef = useRef<ChatMessageType[]>([]);

  const nextMessageId = () => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  };

  const appendMessages = (newMessages: Message | Message[]) => {
    setMessages((prev) => [
      ...prev,
      ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
    ]);
  };

  // Initialize services and load knowledge base
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Validate required environment variables
        const apiKey = apiKeyRef.current?.trim();
        const googleSheetsApiKey = googleSheetsApiKeyRef.current?.trim();
        const googleSheetId = googleSheetIdRef.current?.trim();

        if (!apiKey) {
          throw new Error("OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your environment.");
        }

        if (!googleSheetsApiKey || !googleSheetId) {
          throw new Error("Google Sheets configuration is incomplete. Please set VITE_GOOGLE_SHEETS_API_KEY and VITE_GOOGLE_SHEET_ID in your environment.");
        }

        // Initialize Google Sheets Service
        googleSheetsServiceRef.current = new GoogleSheetsService(
          googleSheetsApiKey,
          googleSheetId,
          googleSheetRangeRef.current
        );

        // Fetch and load knowledge base
        const sheetData = await googleSheetsServiceRef.current.fetchSheetData();
        knowledgeBaseServiceRef.current.loadKnowledgeBase(sheetData);

        // Initialize Telegram Service (optional)
        const telegramBotToken = telegramBotTokenRef.current?.trim();
        const telegramChatId = telegramChatIdRef.current?.trim();
        
        if (telegramBotToken && telegramChatId) {
          telegramServiceRef.current = new TelegramService(telegramBotToken, telegramChatId);
          supportTicketServiceRef.current = new SupportTicketService(telegramServiceRef.current);
          console.log('✅ Telegram support ticket system enabled');
          
          // Test connection
          const isConnected = await telegramServiceRef.current.testConnection();
          if (!isConnected) {
            console.warn('⚠️ Telegram connection test failed. Support tickets may not work.');
          }
        } else {
          console.log('ℹ️ Telegram not configured. Support ticket system disabled.');
        }

        // Initialize Chat Service
        chatServiceRef.current = new ChatService(
          {
            apiKey,
            referer: refererRef.current,
            title: titleRef.current,
          },
          knowledgeBaseServiceRef.current,
          supportTicketServiceRef.current || undefined,
          friendlyResponseServiceRef.current,
          assistanceServiceRef.current,
          languageServiceRef.current
        );

        setIsInitializing(false);
        console.log('✅ Services initialized successfully');
        console.log('📊', knowledgeBaseServiceRef.current.getSummary());
      } catch (error) {
        console.error('❌ Failed to initialize services:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
        setIsInitializing(false);
      }
    };

    void initializeServices();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = () => {
    if (isThinking || isInitializing) return;

    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Check if services are initialized
    if (!chatServiceRef.current) {
      appendMessages({
        id: nextMessageId(),
        type: "ai",
        message: initError || "Services are not initialized. Please refresh the page.",
      });
      return;
    }

    const userMessage: Message = {
      id: nextMessageId(),
      type: "user",
      message: trimmed,
    };

    appendMessages(userMessage);
    setInputValue("");
    setIsThinking(true);

    // Add to conversation history
    conversationHistoryRef.current.push({
      role: "user",
      content: trimmed,
    });

    const sendToBot = async () => {
      try {
        const aiReply = await chatServiceRef.current!.sendMessage(
          trimmed,
          conversationHistoryRef.current
        );

        // Add AI response to conversation history
        conversationHistoryRef.current.push({
          role: "assistant",
          content: aiReply,
        });

        const aiMessage: Message = {
          id: nextMessageId(),
          type: "ai",
          message: aiReply,
        };

        appendMessages(aiMessage);
      } catch (error) {
        console.error("Chat service error:", error);

        appendMessages({
          id: nextMessageId(),
          type: "ai",
          message: "I apologize, but I encountered an error. Please try again.",
        });
      } finally {
        setIsThinking(false);
      }
    };

    void sendToBot();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputPlaceholder = isThinking
    ? "Thinking..."
    : "Ask about our business...";

  return (
    <div className="w-full h-screen relative overflow-hidden" style={{ background: "#F9FAFB" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.03) 100%)",
        }}
      />

      <div className="w-full h-full flex flex-col">
        {/* Initialization Error Banner */}
        {initError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{initError}</span>
          </div>
        )}

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 pb-40 sm:pb-32 scroll-smooth"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.15) transparent",
          }}
        >
          {messages.length === 0 && !isThinking && (
            <EmptyState
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSend={handleSend}
              handleKeyPress={handleKeyPress}
              placeholder={inputPlaceholder}
              isThinking={isThinking}
            />
          )}

          {messages.length > 0 && (
            <div className="space-y-1">
              {messages.map((msg) => (
                <ChatMessageComponent
                  key={msg.id}
                  type={msg.type}
                  message={msg.message}
                  meta={msg.meta}
                  delay={0}
                />
              ))}
            </div>
          )}

          {isThinking && (
            <div className="flex justify-start mt-4">
              <ThinkingAnimation />
            </div>
          )}
        </div>

        {(messages.length > 0 || isThinking) && (
          <div className="absolute left-1/2 bottom-24 sm:bottom-6 w-full max-w-2xl -translate-x-1/2 px-4 sm:px-8">
            <div
              className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
              style={{
                backgroundColor: "#FFFFFFCC",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.5), 0 0 0 1px rgba(255,255,255,0.3)",
              }}
            >
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={inputPlaceholder}
                  className="flex-1 min-w-0 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/50 backdrop-blur-sm border border-white/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-transparent transition-all"
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    color: "#333",
                    fontSize: "16px",
                  }}
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isThinking || isInitializing}
                  className="p-2.5 rounded-xl shadow-[0_4px_20px_rgba(255,106,0,0.25)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                  style={{
                    background: inputValue.trim() && !isInitializing
                      ? "linear-gradient(135deg, #FF6A00 0%, #FF3300 50%, #FFA14A 100%)"
                      : "linear-gradient(135deg, #ccc 0%, #aaa 100%)",
                  }}
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}
