import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  glowColor?: "cyan" | "purple" | "green";
}

const glowStyles = {
  cyan: "hover:shadow-[0_0_30px_hsl(180,100%,50%,0.3)]",
  purple: "hover:shadow-[0_0_30px_hsl(270,100%,65%,0.3)]",
  green: "hover:shadow-[0_0_30px_hsl(150,100%,50%,0.3)]",
};

const borderHoverStyles = {
  cyan: "hover:border-neon-cyan/50",
  purple: "hover:border-neon-purple/50",
  green: "hover:border-neon-green/50",
};

export const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  glowColor = "cyan",
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-xl bg-card border border-border
        transition-all duration-300
        ${glowStyles[glowColor]}
        ${borderHoverStyles[glowColor]}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
