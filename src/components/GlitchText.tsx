import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export const GlitchText = ({ text, className = "", as: Tag = "h1" }: GlitchTextProps) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Tag
      className={`glitch ${isGlitching ? "animate-pulse" : ""} ${className}`}
      data-text={text}
    >
      {text}
    </Tag>
  );
};
