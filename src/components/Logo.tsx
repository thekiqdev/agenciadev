import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

export const Logo = ({ showText = true, size = "md", linkTo = "/" }: LogoProps) => {
  const sizes = {
    sm: { container: "w-8 h-8", text: "text-lg", bracket: "text-lg" },
    md: { container: "w-10 h-10", text: "text-xl", bracket: "text-2xl" },
    lg: { container: "w-14 h-14", text: "text-2xl", bracket: "text-3xl" },
  };

  const LogoContent = () => (
    <div className="flex items-center gap-2 group">
      {/* Animated Tech Logo Icon */}
      <div className={`${sizes[size].container} relative`}>
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulsing square */}
        <motion.div
          className="absolute inset-1 rounded-md bg-gradient-to-br from-primary via-primary/80 to-neon-purple"
          animate={{ 
            boxShadow: [
              "0 0 10px hsl(var(--primary) / 0.5)",
              "0 0 25px hsl(var(--primary) / 0.8)",
              "0 0 10px hsl(var(--primary) / 0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Code brackets */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className={`font-mono font-bold text-background ${sizes[size].bracket} leading-none`}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {"</>"}
          </motion.span>
        </div>

        {/* Corner accents */}
        <motion.div 
          className="absolute -top-0.5 -left-0.5 w-2 h-2 border-l-2 border-t-2 border-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="absolute -top-0.5 -right-0.5 w-2 h-2 border-r-2 border-t-2 border-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div 
          className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-l-2 border-b-2 border-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-r-2 border-b-2 border-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />
      </div>

      {/* Text */}
      {showText && (
        <div className={`${sizes[size].text} font-bold flex items-baseline`}>
          <motion.span 
            className="text-primary"
            animate={{ 
              textShadow: [
                "0 0 5px hsl(var(--primary) / 0.3)",
                "0 0 15px hsl(var(--primary) / 0.6)",
                "0 0 5px hsl(var(--primary) / 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Agência
          </motion.span>
          <span className="text-foreground ml-1">Dev</span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};
