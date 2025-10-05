import { motion } from "motion/react";

export function ThinkingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5"
    >
      {/* Glowing gradient sphere */}
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Main sphere with gradient */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #FF6A00 0%, #FF3300 50%, #FFA14A 100%)",
          }}
        />
        
        {/* Glossy highlight overlay */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.3) 100%)",
          }}
        />
        
        {/* Shine effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/60 blur-sm"
        />
      </div>

      {/* Thinking text with animated dots */}
      <div className="flex items-center gap-1" style={{ color: "#555" }}>
        <span className="tracking-tight" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "15px", fontWeight: 500 }}>
          Thinking
        </span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
          className="tracking-tight"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "15px", fontWeight: 500 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
            times: [0, 0.5, 1],
          }}
          className="tracking-tight"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "15px", fontWeight: 500 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
            times: [0, 0.5, 1],
          }}
          className="tracking-tight"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "15px", fontWeight: 500 }}
        >
          .
        </motion.span>
      </div>
    </motion.div>
  );
}
