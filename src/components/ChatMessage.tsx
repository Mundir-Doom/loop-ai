import { motion } from "motion/react";

interface ChatMessageMeta {
  details?: string[];
  timestamp?: string;
}

interface ChatMessageProps {
  type: "user" | "ai";
  message: string;
  delay?: number;
  meta?: ChatMessageMeta;
}

export function ChatMessage({ type, message, delay = 0, meta }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`flex ${type === "user" ? "justify-end" : "justify-start"} mb-3 sm:mb-4`}
    >
      <div
        className={`
          max-w-[85%] sm:max-w-[70%] px-4 sm:px-5 py-3 sm:py-3.5 rounded-[16px] sm:rounded-[18px]
          ${type === "user" ? "bg-gray-200/80" : "bg-white/80"} backdrop-blur-md
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          ${type === "user" ? "rounded-tr-md" : "rounded-tl-md"}
        `}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#333",
          lineHeight: "1.6",
        }}
      >
        {message}

        {meta && (meta.details?.length || meta.timestamp) ? (
          <div
            className="mt-2 text-[12px] sm:text-xs text-gray-500/80 space-y-1"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {meta.details?.map((detail, index) => (
              <div key={index}>{detail}</div>
            ))}
            {meta.timestamp && <div>{meta.timestamp}</div>}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
