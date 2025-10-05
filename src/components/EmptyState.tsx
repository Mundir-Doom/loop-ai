import { motion } from "motion/react";
import { Send } from "lucide-react";
import type { KeyboardEvent } from "react";

interface EmptyStateProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSend: () => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  isThinking: boolean;
}

export function EmptyState({
  inputValue,
  setInputValue,
  handleSend,
  handleKeyPress,
  placeholder,
  isThinking,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full px-4 pb-24 sm:pb-0"
    >
      {/* Globe with glow */}
      <div className="relative mb-6 sm:mb-8">
        {/* Pulsating outer aura with rich colors - reduced */}
        <motion.div
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1.6, 1.75, 1.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, #FF6A00 0%, #FF3366 30%, #FFCC00 60%, #FF3300 100%)",
            filter: "blur(50px)",
          }}
        />

        {/* Secondary pulsating layer for depth - reduced */}
        <motion.div
          animate={{
            opacity: [0.2, 0.15, 0.2],
            scale: [1.4, 1.55, 1.4],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, #FFCC00 0%, #FF3366 50%, #FF6A00 100%)",
            filter: "blur(40px)",
          }}
        />

        {/* Main globe */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24">
          {/* Base rotating gradient sphere with vibrant colors */}
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{
              rotate: {
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FF3366 25%, #FFCC00 50%, #FF3300 75%, #FF6A00 100%)",
            }}
          />

          {/* Inner light refraction layer */}
          <motion.div
            animate={{ 
              rotate: -360,
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              rotate: {
                duration: 7,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, rgba(255,204,0,0.7) 0%, rgba(255,51,102,0.5) 25%, rgba(255,106,0,0.6) 50%, rgba(255,51,0,0.8) 75%, rgba(255,204,0,0.7) 100%)",
              mixBlendMode: "screen",
            }}
          />

          {/* Moving liquid specular highlights */}
          <motion.div
            animate={{ 
              rotate: -360,
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 65%, rgba(255,255,255,0.5) 100%)",
            }}
          />

          {/* Secondary counter-rotating highlight for liquid effect */}
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%)",
            }}
          />

          {/* Glossy shine effect with pulsation */}
          <motion.div
            animate={{
              opacity: [0.5, 0.9, 0.5],
              scale: [1, 1.15, 1],
              x: [0, 2, 0],
              y: [0, 2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/80 blur-md"
          />

          {/* Inner glow for depth */}
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute inset-2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(8px)",
            }}
          />

          {/* Edge highlight for 3D effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, transparent 40%, rgba(255,255,255,0.15) 70%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Simple headline with metallic shine */}
      <div className="relative mb-8">
        <h1
          className="relative text-center px-4"
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "clamp(20px, 5vw, 28px)",
            letterSpacing: "-0.02em",
            color: "#1a1a1a",
          }}
        >
          How can we help you?
          
          {/* Metallic shine sweep */}
          <motion.span
            animate={{
              backgroundPosition: ["-200% 0", "200% 0"],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%, transparent 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            How can we help you?
          </motion.span>
        </h1>
      </div>

      {/* Input box below headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full max-w-2xl px-4 sm:px-8"
      >
        <div
          className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          style={{
            backgroundColor: "#FFFFFFCC",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.5), 0 0 0 1px rgba(255,255,255,0.3)",
          }}
        >
          <div className="relative flex items-center gap-2">
            {/* Text input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 min-w-0 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/50 backdrop-blur-sm border border-white/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-transparent transition-all"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                color: "#333",
                fontSize: "16px",
              }}
            />

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking}
              className="p-2.5 rounded-xl shadow-[0_4px_20px_rgba(255,106,0,0.25)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              style={{
                background: inputValue.trim()
                  ? "linear-gradient(135deg, #FF6A00 0%, #FF3300 50%, #FFA14A 100%)"
                  : "linear-gradient(135deg, #ccc 0%, #aaa 100%)",
              }}
            >
              <Send className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
